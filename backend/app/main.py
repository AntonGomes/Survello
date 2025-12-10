from __future__ import annotations

from fastapi import FastAPI
from sqlalchemy import text

from app.api.users import router as users_router
from app.api.generate import router as generate_router
from app.db import engine
from app.core.logging import logger


def create_app() -> FastAPI:
    app = FastAPI()
    app.include_router(users_router)
    app.include_router(generate_router)
    return app


app = create_app()


@app.on_event("startup")
def _startup() -> None:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Database connection established")
    except Exception:
        logger.exception("Database connection failed")
        raise

    logger.info("Application startup complete")
