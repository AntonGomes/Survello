from __future__ import annotations

from typing import Annotated, Generator, TypeAlias

from fastapi import Depends, HTTPException, status, Request
from sqlmodel import Session, select
from openai import OpenAI

from app.core.db import engine
from app.core.settings import get_settings
from app.core.s3 import S3Client

from app.models.user_model import User, Session as UserSession

from app.services.storage import StorageService
from app.services.llm import BaseLLMService, OpenAIService


def get_db() -> Generator[Session, None, None]:
    """Yield a database session."""
    with Session(engine) as session:
        yield session


def get_openai_client() -> OpenAI:
    settings = get_settings()
    return OpenAI(api_key=settings.openai_api_key)


def get_llm_service(client: OpenAI = Depends(get_openai_client)) -> BaseLLMService:
    """Get LLM service. Swap implementation here to change providers."""
    settings = get_settings()
    if settings.use_mock_llm:
        from app.services.llm import MockLLMService

        return MockLLMService()

    return OpenAIService(client)


def get_s3_client() -> S3Client:
    """Create S3 client from settings."""
    settings = get_settings()
    return S3Client(
        bucket_name=settings.s3_bucket_name or "",
        region=settings.aws_default_region or "eu-north-1",
        endpoint_url=settings.s3_endpoint_url,
        access_key=settings.aws_access_key,
        secret_key=settings.aws_secret_key,
    )


def get_storage_service(s3_client: S3Client = Depends(get_s3_client)) -> StorageService:
    return StorageService(s3_client)


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """Authenticate user from session cookie."""
    token = request.cookies.get("session_token")
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session token missing")

    stmt = select(UserSession).where(UserSession.session_token == token)
    session = db.exec(stmt).first()

    if not session or not session.user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid session")

    return session.user


# Type aliases
CurrentUserDep: TypeAlias = Annotated[User, Depends(get_current_user)]
LLMDep: TypeAlias = Annotated[BaseLLMService, Depends(get_llm_service)]
StorageDep: TypeAlias = Annotated[StorageService, Depends(get_storage_service)]
DBDep: TypeAlias = Annotated[Session, Depends(get_db)]
SessionDep: TypeAlias = Annotated[Session, Depends(get_db)]
