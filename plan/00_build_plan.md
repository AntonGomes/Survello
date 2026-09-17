# Survello — Build Plan

Companion to `REQUIREMENTS.md`. That file is what gets built; this one is how.

**You do not need to read this.** It exists so that every technical decision is
already made and written down. Nothing in here needs your input. The only things
I'll come back to you for are: the real invoice example, the real schedule examples,
and what you want changed about the look once it works.

---

## 1. What we're optimising for

In priority order, because these conflict:

1. **Two users, forever.** Every "what if we had 10,000 users" instinct is wrong here.
   Simplicity beats scalability at every single decision point.
2. **Cheap and quiet.** Target under $25/month excluding AI usage. Nothing that bills
   by surprise.
3. **No operational attention.** After setup, the only interaction is `git push`.
4. **The site→schedule loop actually working**, because that's the hours it saves.

Explicitly not goals: multi-tenancy at scale, high availability, regulatory
compliance, anything sellable to other firms.

---

## 2. Decisions

### Backend: Go

One statically-linked binary. No runtime to install, no virtualenv, no dependency
drift, ~30MB of RAM at rest. It cross-compiles to ARM so it runs on the cheapest
instance AWS sells. This is the single biggest reason it'll be cheap: the current
Python + Celery + Redis + Postgres shape needs roughly four things running and costs
maybe $50–70/month at minimum; the Go shape needs one and costs single digits.

- **HTTP:** `net/http` with Go 1.22 routing patterns, wrapped in
  [Huma v2](https://huma.rocks). Huma generates the OpenAPI spec from the Go handler
  types automatically, which keeps your existing `sync_types.sh` workflow alive —
  the frontend TypeScript client is still generated, nothing is hand-written twice.
- **Database access:** [sqlc](https://sqlc.dev) — you write SQL, it generates typed Go.
  No ORM, no magic, no N+1 surprises.
- **Migrations:** [goose](https://github.com/pressly/goose), embedded in the binary
  and run automatically on boot. Deploys never need a separate migration step.

### Database: SQLite

Not Postgres. For two users on one box, SQLite is faster (no network hop), free (no
RDS bill — this alone saves ~$30/month), and has no maintenance surface. Using
`modernc.org/sqlite`, the pure-Go driver, so there's no cgo and cross-compilation
stays trivial.

Durability is handled by **Litestream**, which streams the write-ahead log to S3
continuously. Worst-case data loss is a couple of seconds, and restore is one command
against an S3 bucket. This is a well-trodden setup, not a clever one.

Full-text search uses SQLite's built-in **FTS5** across jobs, notes, emails, documents
and schedule items. No search service, no vector database — at this document volume,
FTS5 plus sending whole documents to the model with prompt caching beats embeddings
on both quality and cost. The existing `embedding_model.py` gets dropped.

### Background work: a table and a goroutine

No Celery, no Redis, no SQS. A `jobs` table in SQLite is the queue; a few worker
goroutines in the same process pull from it. Work survives restarts because it's in
the database, which is the only property the Celery plan (`01_migration_to_celery.md`)
was actually after. That plan is superseded — it solved a problem created by Python's
concurrency model, and Go doesn't have it.

A cron-style ticker in the same process runs the daily work: chaser rules, key-date
alerts, the morning email.

### Frontend: Vite + React SPA

Keeping **all** the Tailwind styling and shadcn/ui components exactly as they are —
they're just React and Tailwind, they port across untouched. Moving off Next.js to
plain Vite because:

- It builds to static files, which get embedded directly into the Go binary
  (`embed.FS`). One artifact, one deploy, no CORS, no second server to host.
- Offline support via `vite-plugin-pwa` is straightforward, where Next.js fights you.
  Offline is a hard requirement for site capture, so this matters.

Routing moves to React Router. That's a mechanical change to the page files
(`next/link` → `Link`, `useRouter` → `useNavigate`), not a redesign. TanStack Query,
React Hook Form and Zod all stay.

### Offline site capture

The PWA installs to the iPad home screen. Photos, voice recordings, locations and
notes are written to **IndexedDB** immediately and queued; a service worker drains
the queue to S3 when there's signal. The UI always shows how many items are waiting,
because silent sync failure is the one thing that would destroy trust in it.

### AI

- **Claude** for the language work. Haiku for cheap classification (matching emails to
  jobs), Sonnet for the main schedule drafting and photo analysis, Opus only for lease
  clause extraction where accuracy is worth the money. Prompt caching on the lease and
  cost library, which is where the savings are.
- **Whisper API** for voice transcription. About half a penny a minute.
- Existing prompts in `backend/app/prompts/` are ported over — they're the genuinely
  valuable part of the current codebase, along with the process documented in
  `DILAPS_PROCESS.md`.
- **Document context.** Everything uploaded to a job can be fed to a generation run.
  Files are uploaded once through the Files API and referenced by `file_id` on every
  later run, so a 200-page lease is not re-sent each time. PDFs and images go to the
  model as-is — including scanned ones, which are read visually, so no OCR service is
  needed. DOCX and XLSX are text-extracted in pure Go. **No LibreOffice in the
  container**: it would roughly triple the image size and needs more RAM than the cheap
  instance has, and the only formats it would add are legacy binary Office files and
  CAD. Those are handled by asking for a PDF export, which is one click at source.
- **Document prerequisites are checked before the job is queued**, not inside the
  worker. A schedule type's config carries `required_doc_roles` and
  `recommended_doc_roles`; the generation handler resolves the job's tagged documents
  against them and rejects the request with the specific missing roles before a single
  token is spent. Readability is checked at the same point — a file tagged `lease` that
  yields no extractable text or pages counts as missing, so a corrupt upload fails
  loudly at the start rather than producing a confident, baseless draft.
- **Citations are a first-class API feature, not something we build.** Setting
  `citations: {enabled: true}` on each document block makes the model return
  `cited_text` plus a 1-indexed `page_location` for every claim, which is exactly what
  "evidence on every line" needs. Caveat to resolve at build time: citations are
  incompatible with `output_config.format`, so the structured schedule rows come back
  through a `strict: true` tool call rather than a response format. If that combination
  turns out to be blocked too, generation splits into two passes — cited extraction,
  then structuring — which costs a little more but keeps the page references.
- **Limits worth designing around:** 32MB per request and 600 pages per PDF. Files API
  references keep the request small, but a very large bundle still gets split across
  passes and merged, rather than silently truncated.
- **The rate research agent** is a queued background job with its own budget, separate
  from the schedule budget so one can't starve the other. For each rate it re-fetches
  the cited source URL, searches for a current figure where the source has moved or
  died, and returns a proposed change with its evidence. It writes to a
  `rate_change_proposal` table and never touches the live rate — applying a proposal is
  a human action that creates a new rate version.
- Every run records its token spend against a monthly budget in settings. Hitting the
  cap stops new work and says so, rather than quietly running up a bill.

### Why not self-host a model

Asked and answered here so it doesn't get re-litigated.

**On the app's own server: impossible.** The instance has 1–2GB of RAM and a shared
vCPU. It runs a Go binary in about 30MB. There is no model worth using that fits.

**On a GPU instance: about 25× more expensive than the thing it replaces.** The cheapest
practical GPU instance on AWS runs into the hundreds of dollars a month, against an
expected API bill in the low tens. It also reintroduces exactly the operational burden
the hosting decision was made to avoid.

**On a machine in the office: technically possible, fails the requirements.** It would
have to be always on, reachable, patched and backed up — and the class of model that
runs on a desktop is not the class you want reading a lease. A misread covenant produces
a schedule claiming for something the tenant was entitled to do. That is the one output
where being wrong is worse than being slow or expensive, and it would be traded away to
save perhaps £15 a month.

**The one honest exception is transcription.** Whisper-class models genuinely do run on
CPU. But voice notes cost roughly 8p per job through the API, and the RAM it would take
on the small instance is worth more than the saving. Revisit only if transcription
volume grows by an order of magnitude.

**Where the savings actually are** — all in how the API is called, not who hosts it:

- **Model mix.** Haiku for classification (email→job matching), Sonnet for the bulk of
  schedule drafting and photo analysis, Opus reserved for lease covenant extraction
  where being wrong is expensive.
- **Prompt caching** on the lease and cost library. A second run against the same job
  re-reads the cached prefix at a fraction of the price, and re-runs are common.
- **Image discipline.** Photos are a large share of the input tokens on a generation
  run. They are resized before they are sent, and sent per location rather than all at
  once, so a re-run of one room doesn't re-send the whole survey.
- **The Batch API** (half price) for the rate research agent, which runs twice a year
  and has no reason to be fast. Not for schedule generation, where the user is waiting.

**Expected order of magnitude:** a full generation on a job with a 100-page lease and
~60 photos costs roughly £0.50–£1.50 depending on model choice. At ten schedules a
month that is £5–£15, with everything else rounding to noise. Measure properly with the
token counting endpoint during Phase 6 rather than trusting this estimate — but it is
the right scale, and it is why self-hosting does not pay.

### Documents out

- **PDF:** [Typst](https://typst.app) — a single static binary in the container. Data
  goes in as JSON, templates are text files, output is genuinely well-typeset. Used
  for invoices, schedules and photo appendices.
- **Excel:** [excelize](https://github.com/qax-os/excelize), formulas intact.
- **Word:** template `.docx` with placeholder substitution, so the house style is
  preserved and the final tidy-up happens where it always happens.

Dummy templates ship now under `templates/`. When you send real examples, changing
them is editing a text file — no code changes.

### Email

**Microsoft Graph API**, OAuth sign-in once. Not IMAP. This matters for one specific
reason: sending through Graph puts the message in the real Sent Items and keeps the
thread ID, so when the client replies it lands in Outlook in the right conversation.
Anything else splits every thread in half and the firm would stop using it in a week.

If the firm turns out to be on Gmail, the same interface gets a Gmail implementation —
the code is written against a small `MailProvider` interface for exactly that reason.

### Hosting

**AWS Lightsail instance** (ARM, smallest size that's comfortable), running Docker:

```
Caddy  ──►  survello (Go binary: API + embedded UI + workers)  ──►  SQLite file
  │                                                                    │
  └── automatic HTTPS                                Litestream ───► S3 (backups)
                                                                       │
                                        photos, documents ─────────────┘
```

Lightsail rather than ECS/Fargate because it's a flat monthly price with bandwidth
included, no load balancer to pay for (an ALB alone costs more than this entire
setup), no VPC or IAM to configure, and automatic snapshots are a checkbox.

`unattended-upgrades` handles OS patching. GitHub Actions builds on merge to `main`,
pushes the image, restarts the container. Rollback is redeploying the previous tag.

### Rough monthly cost

| | |
|---|---|
| Lightsail instance | ~$5–12 |
| S3 (photos, documents, backups) | ~$1–3 |
| Route 53 hosted zone + domain | ~$1.50 |
| Sentry, GitHub Actions | $0 (free tiers) |
| **Fixed total** | **~$8–17** |
| Claude + Whisper usage | ~$5–30 depending on how many schedules |

No RDS, no Redis, no load balancer, no Vercel. Those four absences are the whole
saving.

---

## 3. What survives from the current codebase

**Kept:**
- Every Tailwind style and shadcn component. The look doesn't change.
- Page layouts and UI flows — they're reimplemented against the new router, not redrawn.
- The prompts in `backend/app/prompts/`. Hard-won, ported as-is.
- `DILAPS_PROCESS.md` — the domain knowledge in it drives the Phase 6 build.
- The shape of the data model: clients, leads, quotes, instructions, jobs, time
  entries, surveys, files, orgs. Translated to SQL schema, largely 1:1.

**Replaced:**
- FastAPI backend → Go.
- Postgres + Alembic → SQLite + goose.
- The Celery/Redis plan → the `jobs` table.
- Next.js → Vite SPA embedded in the binary.
- Embeddings/pgvector → FTS5 + prompt caching.

**Migration:** there's no production data to preserve, so the new app starts clean
with a one-off spreadsheet importer (Phase 8 non-functionals) to load real clients and
live jobs on day one.

---

## 4. Build order

Each phase ends with something usable. Nothing is built that can't be used until a
later phase arrives.

| Phase | What lands | Why here |
|---|---|---|
| **1. Foundations** | Deployed, logged-in, empty app with backups running | Deploying on day one means deploying is never frightening |
| **2. Work management** | Clients, jobs, key dates, time tracking | Replaces the spreadsheet — real value immediately |
| **3. Money** | Invoices, expenses, mileage, WIP | Needs Phase 2's time entries to bill from |
| **4. Site capture** | Offline photos, voice notes, locations | The hardest technical piece; standalone value even before schedules |
| **5. Cost library** | Editable, cited rates | Must exist before schedules can be priced |
| **6. Schedules** | Generation, review, NL editing, all exports | The core product; needs 4 and 5 |
| **7. Email** | Outlook ingestion, drafting, filing | Fiddliest, least essential, and needs jobs to file against |
| **8. Dashboard & search** | The eight numbers, search, morning email | Needs data from everything above to be informative |

The dashboard grows a tile at a time as each phase lands; Phase 8 is where it gets
designed properly rather than accumulated.

---

## 5. Repository shape

```
/cmd/survello         entrypoint
/internal/
  http/               handlers, Huma routes, OpenAPI
  db/                 sqlc-generated code, queries/, migrations/
  jobs/               queue, workers, scheduled tasks
  ai/                 Claude + Whisper clients, prompts, spend tracking
  mail/               MailProvider interface, Graph implementation
  render/             Typst / excelize / docx exporters
  storage/            S3
/web/                 Vite + React app (embedded at build time)
/templates/           invoice + schedule templates (dummy now, yours later)
/deploy/              Dockerfile, Caddyfile, GitHub Actions
/plan/                this
```

---

## 6. What I need from you, and when

| When | What |
|---|---|
| Before Phase 3 ships | An example invoice (a real one, redacted if you like) |
| Before Phase 6 ships | An example of each schedule type the firm produces |
| Before Phase 7 starts | Confirmation the firm is on Microsoft 365 / Outlook |
| Once Phase 2 is usable | Your notes on the look and feel |

Nothing blocks on these — dummy versions ship in the meantime and get swapped out.
