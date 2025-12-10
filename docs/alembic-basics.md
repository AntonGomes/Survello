## Alembic quickstart (Postgres + SQLAlchemy)

Alembic manages schema migrations so existing tables get altered instead of recreated. Typical flow:

1) Install and init  
```bash
cd backend
pip install alembic
alembic init migrations
```

2) Wire metadata and DB URL  
- In `alembic.ini`, set `sqlalchemy.url = ${DATABASE_URL}` (or leave blank and read it in `migrations/env.py`).  
- In `migrations/env.py`, import your Base and set `target_metadata = Base.metadata`:
```python
from app.db import Base
target_metadata = Base.metadata
```
Ensure `DATABASE_URL` is exported (or in `.env`) when you run Alembic.

3) Generate a migration  
After changing models, autogenerate a script:
```bash
alembic revision --autogenerate -m "describe change"
```
Review the new file in `migrations/versions/` and edit if needed.

4) Apply migrations  
```bash
alembic upgrade head   # apply latest
```
To roll back one step: `alembic downgrade -1`.

5) Ongoing loop  
Repeat: edit models → `revision --autogenerate` → review → `upgrade head`. Do not use `create_all` for schema changes on existing tables; rely on Alembic instead.
