from __future__ import annotations

from collections.abc import Generator
from typing import Annotated, TypeAlias

from fastapi import Depends, HTTPException, Request, status
from openai import OpenAI
from sqlmodel import Session, select

from app.core.db import engine
from app.core.s3 import S3Client
from app.core.settings import get_settings
from app.models.user_model import Session as UserSession
from app.models.user_model import User
from app.services.ai.provider import EmbeddingProvider, VisionProvider
from app.services.llm import BaseLLMService, OpenAIService
from app.services.storage import StorageService


def get_db() -> Generator[Session, None, None]:
    """Yield a database session."""
    with Session(engine) as session:
        yield session


def get_openai_client() -> OpenAI:
    settings = get_settings()
    return OpenAI(api_key=settings.openai_api_key)


def get_llm_service(
    client: Annotated[OpenAI, Depends(get_openai_client)],
) -> BaseLLMService:
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


def get_storage_service(
    s3_client: Annotated[S3Client, Depends(get_s3_client)],
) -> StorageService:
    return StorageService(s3_client)


def get_current_user(request: Request, db: Annotated[Session, Depends(get_db)]) -> User:
    """Authenticate user from session cookie."""
    token = request.cookies.get("session_token")
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session token missing")

    stmt = select(UserSession).where(UserSession.session_token == token)
    session = db.exec(stmt).first()

    if not session or not session.user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid session")

    return session.user


class GenerationServices:
    def __init__(self, storage: StorageService, llm: BaseLLMService):
        self.storage = storage
        self.llm = llm


def get_generation_services(
    storage: Annotated[StorageService, Depends(get_storage_service)],
    llm: Annotated[BaseLLMService, Depends(get_llm_service)],
) -> GenerationServices:
    return GenerationServices(storage, llm)


def get_vision_provider() -> VisionProvider:
    settings = get_settings()
    if settings.use_mock_llm or settings.mock_dilaps_vision:
        from app.services.ai.mock import MockVisionProvider

        return MockVisionProvider()

    from app.services.ai.gemini import GeminiVisionProvider

    return GeminiVisionProvider(api_key=settings.gemini_api_key or "")


def get_embedding_provider() -> EmbeddingProvider:
    settings = get_settings()
    if settings.use_mock_llm or settings.mock_dilaps_embedding:
        from app.services.ai.mock import MockEmbeddingProvider

        return MockEmbeddingProvider()

    from app.services.ai.gemini import GeminiEmbeddingProvider

    return GeminiEmbeddingProvider(api_key=settings.gemini_api_key or "")


class DilapsServices:
    def __init__(
        self,
        storage: StorageService,
        vision: VisionProvider,
        embedding: EmbeddingProvider,
    ):
        self.storage = storage
        self.vision = vision
        self.embedding = embedding


def get_dilaps_services(
    storage: Annotated[StorageService, Depends(get_storage_service)],
    vision: Annotated[VisionProvider, Depends(get_vision_provider)],
    embedding: Annotated[EmbeddingProvider, Depends(get_embedding_provider)],
) -> DilapsServices:
    return DilapsServices(storage, vision, embedding)


CurrentUserDep: TypeAlias = Annotated[User, Depends(get_current_user)]
LLMDep: TypeAlias = Annotated[BaseLLMService, Depends(get_llm_service)]
StorageDep: TypeAlias = Annotated[StorageService, Depends(get_storage_service)]
VisionDep: TypeAlias = Annotated[VisionProvider, Depends(get_vision_provider)]
EmbeddingDep: TypeAlias = Annotated[EmbeddingProvider, Depends(get_embedding_provider)]
DBDep: TypeAlias = Annotated[Session, Depends(get_db)]
SessionDep: TypeAlias = Annotated[Session, Depends(get_db)]
GenServicesDep: TypeAlias = Annotated[
    GenerationServices, Depends(get_generation_services)
]
DilapsServicesDep: TypeAlias = Annotated[DilapsServices, Depends(get_dilaps_services)]
