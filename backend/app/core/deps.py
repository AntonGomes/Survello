from __future__ import annotations

from functools import lru_cache
from typing import Generator

from openai import OpenAI
from sqlalchemy.orm import Session

from app.core.settings import get_settings
from app.db import SessionLocal


@lru_cache()
def get_openai_client() -> OpenAI:
    """Shared OpenAI client instance."""
    settings = get_settings()
    return OpenAI(api_key=settings.openai_api_key)


def get_db() -> Generator[Session, None, None]:
    """Request-scoped database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()