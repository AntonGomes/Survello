## Local development quickstart

### Backend API
- From `backend/`: `uv run uvicorn app.main:app --reload`
- DB config via `.env` (`DATABASE_URL` or `DB_*`). Alembic: `uv run alembic upgrade head`

### Dummy storage (local presigned URLs)
- Start dummy S3: `uv run uvicorn dummy_s3:app --reload --port 9002`
- In `backend/.env`, set:  
  `STORAGE_BACKEND=local`  
  `STORAGE_BASE_URL=http://localhost:9002`  
  (files saved under `_dummy_s3_storage/`)

### Real S3 (optional)
- Set `STORAGE_BACKEND=s3` and provide `S3_BUCKET_NAME`, `S3_ENDPOINT_URL` (if using MinIO/LocalStack), `S3_ACCESS_KEY`, `S3_SECRET_KEY`.

### Frontend (Next.js)
- From `ui/`: `npm install` (first time), then `npm run dev`
- Auth0: ensure `.env.local` is populated so `/api/users` sees a session.

### User upsert behavior
- `/users/upsert/{external_id}` uses Postgres `ON CONFLICT` on `external_id` to create or update and return the user id.

### Migrations
- Change models → `uv run alembic revision --autogenerate -m "…"`, review, then `uv run alembic upgrade head`.
