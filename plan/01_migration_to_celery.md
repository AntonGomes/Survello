# Migration Plan: Asynchronous Document Generation with Celery & Redis

## 1. The Problem: Synchronous Blocking
Currently, the `ProcessingOrchestrator` runs inside the FastAPI process using `BackgroundTasks`.
*   **Resource Starvation:** PDF conversion (LibreOffice) is CPU-heavy. Running it on the web server blocks other incoming requests.
*   **Reliability:** If the web server restarts (deployment or crash), all running background tasks are lost immediately.
*   **Scalability:** You cannot scale "Workers" independently of "Web Servers".

## 2. The Solution: The "Waiter & Chef" Architecture
We will decouple the **Request** (FastAPI) from the **Execution** (Celery).

*   **FastAPI (The Waiter):** Accepts the order, writes a ticket, and immediately returns "Order Received".
*   **Redis (The Ticket Rail):** Holds the tasks in a queue.
*   **Celery (The Chef):** A separate process that picks up tasks and executes the heavy logic.

## 3. Architecture Overview

### Components
1.  **Producer (FastAPI):** Pushes `job_id` to Redis.
2.  **Broker (Redis):** Stores the queue of job IDs.
3.  **Consumer (Celery Worker):** Pulls `job_id`, fetches data from DB/S3, runs `ProcessingOrchestrator`.
4.  **Result Store (Postgres):** The worker updates the `Job` status in the database (Pending -> Running -> Completed).

### Flow
1.  **Next.js** calls `POST /generate`.
2.  **FastAPI** creates `Job` in Postgres (Status: `pending`).
3.  **FastAPI** sends `job.id` to Redis via `celery.delay()`.
4.  **FastAPI** returns `200 OK` with `{ job_id: ... }`.
5.  **Celery Worker** (running in background) sees the new task.
6.  **Celery Worker** executes `ProcessingOrchestrator(job_id)`.
    *   Downloads files (S3).
    *   Converts to PDF (LibreOffice).
    *   Calls OpenAI.
    *   Uploads result (S3).
    *   Updates Postgres (Status: `completed`).

## 4. Implementation Steps

### Phase 1: Local Development Setup
1.  **Add Dependencies:**
    ```bash
    pip install celery redis
    ```
2.  **Run Redis:**
    ```bash
    docker run -d -p 6379:6379 redis
    ```
3.  **Configure Celery (`app/worker.py`):**
    *   Initialize `Celery` app instance.
    *   Define the task `process_document_job(job_id)`.
4.  **Update API (`app/api/generate.py`):**
    *   Replace `background_tasks.add_task` with `process_document_job.delay(job_id)`.

### Phase 2: Infrastructure (AWS)
1.  **Redis:** Deploy **Amazon ElastiCache for Redis** (Serverless or t3.micro).
2.  **Web Server:** Continue using **AWS App Runner** for FastAPI.
3.  **Worker:** Deploy **AWS ECS (Fargate)** for the Celery Worker.
    *   Use the *same* Docker image as the API.
    *   Override the `CMD` to run: `celery -A app.worker.worker worker -l info`.

## 5. Code Changes Required

### `app/worker.py` (New File)
```python
import os
from celery import Celery
from app.core.db import SessionLocal
from app.services.processing import ProcessingOrchestrator
# ... imports ...

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
celery_app = Celery("docgen", broker=redis_url, backend=redis_url)

@celery_app.task(name="process_document_job")
def process_document_job(job_id: str):
    db = SessionLocal()
    try:
        # Re-initialize services (Repo, Storage, OpenAI)
        orchestrator = ProcessingOrchestrator(job_id, ...)
        orchestrator.run()
    finally:
        db.close()
```

### `app/api/generate.py`
```python
from app.worker import process_document_job

@router.post("/create_job")
def create_job(...):
    # ... create job in DB ...
    # Trigger Celery Task
    process_document_job.delay(str(job.id))
    return response
```
