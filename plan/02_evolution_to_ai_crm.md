# Roadmap: Evolution to AI-Powered CRM

## 1. The Vision
Transition from a transactional "Document Generator" to a persistent "AI Workspace".
*   **Old Model:** User uploads files -> We generate a PDF -> User leaves.
*   **New Model:** User creates a "Project" -> Uploads context -> Chats with AI about the project -> Generates documents -> Manages tasks.

## 2. Core Concepts & Terminology

### A. "Project" (formerly Job)
A persistent container for a specific business case (e.g., "Acme Corp Audit 2025").
*   Has a Title, Description, Deadline, Status.
*   Contains multiple **Files** (PDFs, Images, Spreadsheets).
*   Contains multiple **Generation Tasks** (The old "Job" concept).
*   Contains **Chat History**.

### B. "Context" (The Knowledge Base)
*   **Project Context:** Specific files uploaded to this project.
*   **Global Context:** Company-wide knowledge (past projects, templates, best practices).

## 3. AI Strategy: Hybrid Approach

We will use two different strategies depending on the user's intent.

### Scenario A: "Chat with this Project"
*   **Tech:** **Long Context Window** (e.g., GPT-4o, Claude 3.5 Sonnet).
*   **Method:** Fetch the text of *all* files in the project and inject them directly into the System Prompt.
*   **Why:** Higher accuracy than RAG. The model "sees" the whole document structure.
*   **Limit:** ~50 documents (approx 100k-200k tokens).

### Scenario B: "Chat with my Company" (Global Search)
*   **Tech:** **RAG (Retrieval Augmented Generation)** via `pgvector`.
*   **Method:**
    1.  Chunk all uploaded documents into small pieces.
    2.  Generate Embeddings (OpenAI `text-embedding-3-small`).
    3.  Store in Postgres using `pgvector`.
    4.  On query, perform Semantic Search to find top 5 chunks.
*   **Why:** Scales to millions of documents.

## 4. Tech Stack Additions

### Backend
*   **LangGraph:** For orchestrating the chat logic (State Management, Tool Calling).
*   **pgvector:** Postgres extension for storing embeddings (Vector Database).
*   **Celery (New Role):** Asynchronous Ingestion Pipeline (OCR + Embedding generation).

### Frontend
*   **CopilotKit:** React components for the Chat UI (Sidebar, Floating Window) and streaming infrastructure.

## 5. Architecture Changes

### Synchronous vs. Asynchronous
*   **Chat (Sync):** Next.js -> FastAPI -> OpenAI (Stream). Must be instant.
*   **Ingestion (Async):** User Upload -> FastAPI -> Celery.
    *   Celery Task 1: Extract Text (OCR).
    *   Celery Task 2: Generate Embeddings.
    *   Celery Task 3: Save to DB.

## 6. Data Model Migration (`app/models/orm.py`)

### 1. Rename `Job` to `GenerationTask`
The current `Job` table represents a single execution of the doc-gen script.

### 2. Create `Project` Table
```python
class Project(Base):
    __tablename__ = "projects"
    id: UUID
    title: String
    status: String (active, closed)
    custom_fields: JSON
    # Relationships
    files: list[ProjectFile]
    tasks: list[GenerationTask]
```

### 3. Create `ProjectFile` Table
```python
class ProjectFile(Base):
    __tablename__ = "project_files"
    id: UUID
    project_id: UUID
    s3_key: String
    
    # For Context Window
    extracted_text: Text 
    
    # For RAG (Global Search)
    embedding: Vector(1536) 
```

## 7. Implementation Plan

### Step 1: Database Refactor
*   Create migration to rename `jobs` -> `generation_tasks`.
*   Create `projects` and `project_files` tables.
*   Enable `pgvector` extension in Postgres.

### Step 2: Ingestion Pipeline
*   Create a Celery task `ingest_file(file_id)`.
*   Implement text extraction (using existing `document_handler` logic).
*   Implement embedding generation (using OpenAI API).

### Step 3: Chat API (LangGraph)
*   Create `/api/chat` endpoint.
*   Implement `Graph` that:
    1.  Receives `project_id` + `message`.
    2.  Loads `ProjectFile.extracted_text`.
    3.  Constructs System Prompt.
    4.  Calls LLM.
    5.  Streams response.

### Step 4: Frontend (CopilotKit)
*   Install `@copilotkit/react-core` and `@copilotkit/react-ui`.
*   Wrap the Project Page in `<CopilotProvider>`.
*   Add `<CopilotSidebar>` to the layout.
