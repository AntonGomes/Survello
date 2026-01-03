# backend/app/core/deps.py
from __future__ import annotations

from functools import lru_cache
from typing import Generator

from openai import OpenAI
from sqlalchemy.orm import Session

from app.core.settings import get_settings
from app.core.db import Database
from app.core.s3 import S3Client


@lru_cache()
def get_settings_cached():
    # Optional but keeps imports cheaper and consistent with other deps
    return get_settings()


@lru_cache()
def get_openai_client() -> OpenAI:
    settings = get_settings_cached()
    return OpenAI(api_key=settings.openai_api_key)


@lru_cache()
def get_database() -> Database:
    settings = get_settings_cached()
    return Database(
        db_url=settings.db_url,
        db_echo=settings.db_echo,
    )


def get_db() -> Generator[Session, None, None]:
    """Request-scoped database session."""
    db_session = get_database().get_session()
    try:
        yield db_session
    finally:
        db_session.close()


@lru_cache()
def get_s3() -> S3Client:
    """Shared S3 client instance."""
    settings = get_settings_cached()
    return S3Client(
        bucket_name=settings.s3_bucket_name,
        region=settings.aws_default_region,
        endpoint_url=settings.s3_endpoint_url,
        access_key=settings.aws_access_key,
        secret_key=settings.aws_secret_key,
    )
