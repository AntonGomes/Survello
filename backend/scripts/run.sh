#!/bin/bash
set -e

docker start 16302ca7523adb77545a6f310d31a3726f655931241c3c3d300d54e7a593125c

# Run migrations to ensure the DB (Docker instance) is up to date
echo "Running database migrations..."
uv run alembic upgrade head

# Start the backend server
echo "Starting backend server..."
uv run uvicorn app.main:app --reload
