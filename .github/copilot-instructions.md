# DocGen Copilot Instructions

## Architecture Overview

DocGen is a document generation platform consisting of a Python FastAPI backend and a Next.js frontend.

### Core Data Flow (Document Generation)
1. **Presign**: Frontend requests presigned URLs from `/api/generate/presign_uploads`.
2. **Upload**: Frontend uploads files directly to S3 (or local dummy S3).
3. **Job Creation**: Frontend calls `/api/generate/create_job` with file references.
4. **Processing**: Backend spawns a background task (`ProcessingOrchestrator`) to:
   - Download files from storage.
   - Convert documents to PDF/Images (`app/utils/document_handler.py`).
   - Send context to OpenAI (`app/services/openai_service.py`).
   - Generate output document.
5. **Polling**: Frontend polls job status via `useGenerateDoc` hook until completion.

## Backend (Python/FastAPI)

- **Package Manager**: Uses `uv`. Always run commands with `uv run ...`.
- **Structure**:
  - `app/api/`: Routes (e.g., `generate.py`, `users.py`).
  - `app/services/`: Business logic (e.g., `processing.py`, `job_repository.py`).
  - `app/models/`: Pydantic models (`request_models.py`) and SQLAlchemy ORM (`orm.py`).
  - `app/core/`: Configuration and dependencies (`deps.py`).
- **Database**: PostgreSQL with SQLAlchemy and Alembic.
  - **Migrations**: `uv run alembic revision --autogenerate -m "..."` -> `uv run alembic upgrade head`.
  - **Connection**: Managed via `app.core.db.get_database()`.
- **Storage**: Abstracted via `StorageService`.
  - **Local Dev**: Uses `dummy_s3.py` (run on port 9002) to emulate S3.
  - **Prod**: Uses AWS S3.

### Key Patterns
- **Dependency Injection**: Use `app.api.deps` for route dependencies (e.g., `JobRepoDep`, `StorageDep`).
- **Orchestration**: Complex logic resides in `ProcessingOrchestrator` (`app/services/processing.py`), not in route handlers.
- **Background Tasks**: Use `FastAPI.BackgroundTasks` to trigger the orchestrator.

## Frontend (Next.js/TypeScript)

- **Framework**: Next.js 15 (App Router).
- **Styling**: Tailwind CSS + Radix UI components.
- **State Management**: React Hooks (e.g., `useGenerateDoc.ts` for the generation workflow).
- **Auth**: Auth0 integration (`@auth0/nextjs-auth0`).

## Critical Developer Workflows

### Running the Stack
1. **Database**: `docker run ... postgres:15` (see README).
2. **Dummy S3**: `uv run uvicorn dummy_s3:app --reload --port 9002`.
3. **Backend**: `cd backend && uv run uvicorn app.main:app --reload`.
4. **Frontend**: `cd ui && npm run dev`.

### Debugging & Testing
- **Logs**: Backend uses `app.core.logging`. Check console output.
- **Tests**: `uv run pytest`.
- **Local Storage**: Files uploaded locally go to `backend/_dummy_s3_storage/`.

## Conventions
- **Imports**: Use absolute imports in backend (e.g., `from app.services...`).
- **Async**: Backend routes are async; database operations in services are typically synchronous (using `Session`).
- **Environment**: Configured via `.env` (backend) and `.env.local` (frontend).
