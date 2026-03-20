# Dilaps Generation Process

End-to-end documentation for the Schedule of Dilapidations generation pipeline.

---

## Overview

The system takes lease documents and survey photographs as input, uses AI to group images into property sections, analyzes each section for dilapidations against lease clauses, and outputs a structured schedule. A review UI lets the surveyor edit everything before exporting to XLSX.

```
Upload → Embed Images → Section Images → Name Sections → Analyze Each Section → Review & Edit → Export XLSX
```

---

## 1. Upload Phase

### Frontend (`/app/generate`)

The user provides:

| Upload Zone | Required | Max Files | Accepts |
|---|---|---|---|
| Lease PDF | Yes | 1 | .pdf |
| Lease Documentation | No | 100 | Any |
| Site Notes | No | 100 | Any |
| Survey Images | Yes | 500 | .png, .jpg, .jpeg, .webp, .heic |
| Misc | No | 100 | Any |

Plus a **property address** (required text input) and optional **job link** (via `?jobId=` URL param).

### Upload Pipeline

The `useDilapsGeneration` hook orchestrates a 4-step upload:

**Step 1 — Presign:** `POST /store/presign`
All files are flattened into a single list with client IDs (`lease-0`, `survey-0`, `survey-1`, ...). The backend generates presigned S3 PUT URLs and storage keys for each file.

**Step 2 — S3 Upload:** `PUT <presigned_url>`
Files are uploaded directly to S3 (MinIO locally, AWS in production) from the browser. Progress is tracked per-file and shown in the UI.

**Step 3 — Register:** `POST /store/`
Files are registered in the database. The backend verifies each file exists in S3, creates `File` records, and generates PDF previews for Office documents.

**Step 4 — Create Dilaps Run:** `POST /dilaps/`
```json
{
  "property_address": "173/175 Glasgow Road, Clydebank",
  "job_id": 42,
  "template_file_id": 1,
  "context_file_ids": [2, 3, 4, 5, 6]
}
```
The lease PDF is sent as `template_file_id`. All other files (images, docs, notes) are `context_file_ids`. This creates a `DilapsRun` record and kicks off the background pipeline.

---

## 2. Background Pipeline

The orchestrator (`app/orchestrators/dilaps.py`) runs as a FastAPI background task. It progresses through three phases, updating `status` and `progress_pct` in the database. The frontend polls `GET /dilaps/{id}` every 2 seconds to show real-time progress.

### Phase 1: Embedding (10–30%)

**Status:** `embedding`

1. **Separate files** into images vs documents based on MIME type
2. **Check cache** — skip files that already have embeddings in the `image_embeddings` table
3. **Download** image bytes from S3 for uncached files
4. **Embed** via `GeminiEmbeddingProvider.embed_images()`:
   - Model: `gemini-embedding-2-preview` (multimodal, supports image bytes natively)
   - Images are passed as `Part.from_bytes(data=img, mime_type="image/jpeg")`
   - Batched in groups of 6 (API limit per request)
   - Output: 768-dimensional float vectors
5. **Store** embeddings in the `image_embeddings` table (cached for reuse across runs)

### Phase 2: Sectioning (40–50%)

**Status:** `sectioning`

**Image Ordering:**
1. Extract EXIF `DateTimeOriginal` (or `DateTime`) from each image using Pillow
2. If >50% of images have timestamps, sort chronologically — surveyors move room-to-room, so temporal order reflects spatial grouping
3. Append any un-timestamped images at the end
4. Fall back to upload order if timestamps are sparse

**Sequential Break Algorithm:**
1. Start with the first image in its own section
2. For each subsequent image, compute cosine similarity between its embedding and the previous image's embedding
3. If similarity < 0.75, start a new section
4. Otherwise, append to the current section

This exploits the sequential nature of surveys — the algorithm only needs to detect "break points" rather than doing full clustering.

**Section Naming:**
1. Pick the middle image from each section as representative
2. Generate presigned URLs for these representative images
3. Send all representative images to Gemini 2.5 Flash with a naming prompt
4. The LLM returns a JSON array of names (e.g., `["Kitchen", "Front Elevation", "Roof"]`)

**Database Records:**
- Create `DilapsSection` for each section with `name` and `sort_order`
- Create `DilapsSectionFileLink` joining each section to its image files

### Phase 3: Analysis (50–95%)

**Status:** `analyzing`

Each section is analyzed sequentially by Gemini 2.5 Flash. A running memory accumulates across sections to prevent duplicate items.

**For each section:**

1. Generate presigned URLs for all images in the section
2. Build the analysis prompt with three context slots:
   - `{lease_context}` — property address + lease summary
   - `{running_memory}` — summaries of items already documented in prior sections
   - `{few_shot_examples}` — JSON examples loaded from `app/prompts/examples/*.json`
3. Send images + prompt to `GeminiVisionProvider.analyze_section()`:
   - Model: `gemini-2.5-flash`
   - Images passed as `Part.from_uri()` with presigned S3 URLs
   - `response_mime_type="application/json"` for structured output
   - `temperature=0.2` for consistency
4. Parse the JSON response:
   ```json
   {
     "items": [
       {
         "lease_clause": "Three",
         "want_of_repair": "Carpet is worn and stained",
         "remedy": "Remove carpet and replace with new",
         "unit": "m²",
         "quantity": 15.0,
         "rate": 48.0,
         "cost": 720.0
       }
     ],
     "memory_update": "Kitchen: worn carpet, soiled walls, damaged units"
   }
   ```
5. Create `DilapsItem` records for each item
6. Append the `memory_update` to the running memory for the next section

**After all sections:** Renumber items hierarchically (e.g., `1.01`, `1.02`, `2.01`, `2.02`).

### Completion

**Status:** `completed`, **Progress:** 100%

The frontend detects completion via polling and redirects to `/app/generate/review?dilapsId={id}`.

### Error Handling

If any phase fails, the run is marked `status=error` with `error_message` set. The frontend shows the error and allows retrying.

---

## 3. LLM Prompts

### Section Analysis Prompt

The system prompt instructs Gemini to act as a chartered building surveyor. Key guidance:

- Reference appropriate lease clauses (Three = repairs, Four = decoration, Five = cleaning, Seven = reinstatement, Eight = statutory compliance)
- Use UK construction pricing (2025 rates)
- Use "Sum" for lump-sum items, metric units (m, m²) for measured items, "No" for counted items
- Include "By Tenant" for items the tenant must action directly
- Do NOT duplicate items already in the running memory

### Section Naming Prompt

Asks Gemini to name each section using standard surveying terminology:
- Interiors: Kitchen, Bedroom 1, WC, Bathroom, Office 3
- Exteriors: Front Elevation, Rear Elevation, Roof
- Common areas: Vestibule, Entrance Hallway, Stairwell

### Few-Shot Examples

JSON files in `app/prompts/examples/` provide in-context learning examples. These should be extracted from real hand-completed dilapidations schedules. The `few_shot_loader` reads all JSON files from this directory and formats them into the prompt.

---

## 4. Review UI

### Layout

Route: `/app/generate/review?dilapsId={id}`

```
┌──────────────────────────────────────────────────────┐
│ ┌────────────┐  ┌──────────────────────────────────┐ │
│ │ Section Nav │  │ Section Editor                   │ │
│ │ (280px)     │  │                                  │ │
│ │             │  │ [Section Name]                   │ │
│ │ ○ Kitchen   │  │ [Image Strip: thumbnails]        │ │
│ │ ● Bedroom 1 │  │                                  │ │
│ │ ○ Bathroom  │  │ ┌──────────────────────────────┐ │ │
│ │ ○ Roof      │  │ │ Items Table                  │ │ │
│ │             │  │ │ Item | Clause | Defect | ... │ │ │
│ │             │  │ │ 2.01 | Three  | Carpet...    │ │ │
│ │             │  │ │ 2.02 | Four   | Walls...     │ │ │
│ │             │  │ │ [+ Add Item]                 │ │ │
│ │             │  │ └──────────────────────────────┘ │ │
│ └────────────┘  └──────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Export Panel: 12 items | £4,250 | [Export XLSX]   │ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### Section Navigation (sidebar)

- Vertical list of section cards showing name, image count, and item count
- Click to select a section
- **Drag-to-reorder** via @dnd-kit
- **Context menu** per section: Merge, Split, Delete
- **Merge workflow:** Select two sections via checkboxes, then click merge — source items and images move to target, source is deleted

### Section Editor (main area)

- **Editable section name** — click to edit inline
- **Image strip** — horizontal scrollable row of 96x96 thumbnails. Click to open full-screen ImageLightbox with navigation arrows and zoom
- **Items table** — the core editing interface (see below)

### Items Table

| Column | Type | Width | Editable |
|---|---|---|---|
| Item No | Auto-generated (e.g., 2.01) | 60px | No |
| Lease Clause | Text input | 100px | Yes |
| Want of Repair | Textarea | Flexible | Yes |
| Remedy | Textarea | Flexible | Yes |
| Unit | Select (Sum / m / m² / No) | 80px | Yes |
| Q | Number input | 70px | Yes |
| R | Number input | 70px | Yes |
| £ | Computed (Q × R) | 80px | No |
| Delete | Ghost button (×) | 40px | — |

- All cells are always editable (no click-to-edit mode)
- Cost auto-recomputes when quantity or rate changes
- **Add Item** button at the bottom appends a blank row
- **Delete** button appears on row hover
- **Section total** shown in footer row

### Export Panel (bottom)

- Total item count and total cost across all sections
- **Export to XLSX** — calls `POST /dilaps/{id}/export`, returns the spreadsheet file
- **Start New** — navigates back to upload page

### State Management

The review UI uses `useReducer` for local state with optimistic updates. All actions:

| Action | Effect |
|---|---|
| `UPDATE_ITEM` | Edit any field, auto-recompute cost and item numbers |
| `ADD_ITEM` | Append blank item to section |
| `DELETE_ITEM` | Remove item, renumber remaining |
| `RENAME_SECTION` | Update section name |
| `REORDER_SECTIONS` | Update sort order after drag |
| `MERGE_SECTIONS` | Move source items/images to target, delete source |
| `SPLIT_SECTION` | Create new section from images after split index |
| `DELETE_SECTION` | Remove section entirely |

---

## 5. XLSX Export

`POST /dilaps/{id}/export` generates a professional spreadsheet using openpyxl.

### Sheet Structure

**Front Pages:**
- "DRAFT" header
- "Schedule of Dilapidations"
- Property address
- General clauses and preliminaries (if lease summary provided)

**Schedule Sheet(s):**
For properties with ≤20 sections, one "Schedule" sheet with sub-sections. For larger properties, separate sheets per section.

Each section contains:
- Section header row (e.g., "Roof", "Ground Floor Kitchen")
- Item rows with columns: Item No | Lease clause | Want of repair | Remedy | U | Q | R | £
- Cost column uses formula `=F{row}*G{row}` for measured items, or a fixed value for Sum items
- Section total row with SUM formula

**Collection Sheet:**
```
COLLECTION
  External .......................... =External!H{total_row}
  Ground Floor ...................... ='Ground Floor'!H{total_row}
  Sub total ......................... =SUM(H5:H{n})
  Contractor preliminaries (20%) .... =H{sub}*0.2
  Sub Total of work items ........... =SUM(...)

  Professional fees:
    Contract administration (10%) ... =H{sub2}*0.1
    Principal Designer (1%) ......... =H{sub2}*0.01
  Sub Total ......................... =SUM(...)

  Preparation fee ................... £1,750
  Negotiation fee (5%) .............. =H{fees}*0.05

  GRAND TOTAL EXCLUDING VAT ......... =SUM(...)
```

### Formatting
- Font: Arial 10pt (headers bold)
- Header fill: Light blue (#D9E1F2)
- Thin borders on all data cells
- Wrap text on description columns
- Number format: `#,##0` (no decimals)

---

## 6. Data Model

### DilapsRun
The top-level record for a generation run.
- Links to a `Run` (general file reference model) which holds the uploaded files
- Tracks `status` (idle → embedding → sectioning → analyzing → completed/error) and `progress_pct`
- Stores `property_address` and optional `lease_summary`
- Has many `DilapsSection` records (ordered by `sort_order`)

### DilapsSection
A group of related images representing one area of the property.
- Has a `name` (LLM-generated, e.g., "Kitchen") and `sheet_name` (for XLSX output)
- Links to image `File` records via `DilapsSectionFileLink` junction table
- Has many `DilapsItem` records (ordered by `sort_order`)

### DilapsItem
A single dilapidation entry.
- `item_number` — hierarchical (e.g., "1.01", auto-generated)
- `lease_clause` — which lease clause is breached (e.g., "Three", "Three, Four")
- `want_of_repair` — description of the defect
- `remedy` — prescribed repair action
- `unit` — Sum, m, m², or No
- `quantity`, `rate`, `cost` — financial estimates (Decimal)

### ImageEmbedding
Cached embedding vectors for images.
- One-to-one with `File` (unique constraint on `file_id`)
- `embedding` — 768-dimensional float vector stored as JSON
- `model_name` — tracks which model produced the embedding
- Cached across runs — if the same image is used in multiple dilaps runs, it won't be re-embedded

---

## 7. AI Provider Architecture

Abstract interfaces allow swapping providers without changing pipeline code.

### VisionProvider
- `analyze_section(image_urls, system_prompt, context) → SectionAnalysis`
- `name_sections(representative_image_urls) → list[str]`

### EmbeddingProvider
- `embed_images(image_data_list) → list[list[float]]`

### Current Implementation: Gemini
- **Vision:** `gemini-2.5-flash` — multimodal, 2M token context window
- **Embedding:** `gemini-embedding-2-preview` — native multimodal embedding, 768 dimensions, batched in groups of 6

### Mock Providers
Controlled by `USE_MOCK_LLM=true` in `.env`. Returns fixture data for local development without API costs.

---

## 8. API Reference

### Generation Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/dilaps/` | Create dilaps run, start background pipeline |
| `GET` | `/dilaps/{id}` | Get run status and progress |

### Section & Item CRUD

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/dilaps/{id}/sections` | All sections with items and image files |
| `PATCH` | `/dilaps/sections/{id}` | Rename section, update sort order |
| `POST` | `/dilaps/sections/{id}/items` | Add new item to section |
| `PATCH` | `/dilaps/items/{id}` | Update item fields |
| `DELETE` | `/dilaps/items/{id}` | Delete item |

### Section Operations

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/dilaps/{id}/merge-sections` | Merge source section into target |
| `POST` | `/dilaps/sections/{id}/split` | Split section at image index |

### Export

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/dilaps/{id}/export` | Generate and download XLSX |
