from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from openai import OpenAI
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import InvalidTokenError
from app.core.deps import get_db, get_openai_client, get_s3
from app.core.s3 import S3Client
from app.core.settings import Settings, get_settings
from app.services.job_repository import JobRepository
from app.services.user_repository import UserRepository
from app.services.storage import StorageService
from app.services.openai_service import OpenAIService

# ---- Service Dependencies --------------------------------------------------




def get_job_repo(db: Session = Depends(get_db)) -> JobRepository:
    return JobRepository(db)


def get_user_repo(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_storage_service(s3: S3Client = Depends(get_s3)) -> StorageService:
    return StorageService(s3)


def get_openai_service(
    client: OpenAI = Depends(get_openai_client),
    settings: Settings = Depends(get_settings),
) -> OpenAIService:
    return OpenAIService(client, settings.openai_api_key)


security = HTTPBearer()

EXPECTED_ISS = "nextjs-bff"
EXPECTED_AUD = "fastapi"

# 1. New Dependency: Just gets the Auth0 ID (No DB check)
def get_current_external_id(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    settings: Settings = Depends(get_settings),
) -> str:
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            key=settings.jwt_secret,
            algorithms=["HS256"],
            issuer=EXPECTED_ISS,
            audience=EXPECTED_AUD,
            options={"require": ["exp", "iss", "aud", "sub"]},
        )
        return payload.get("sub")
    except InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from e

# 2. Updated Dependency: Resolves to Internal UUID (DB check)
def get_current_user_id(
    external_id: str = Depends(get_current_external_id),
    user_repo: UserRepository = Depends(get_user_repo),
) -> str:
    user_id = user_repo.get_user_id_by_external_id(external_id)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not synced. Client must call /api/users/sync first.",
        )
    return str(user_id)

# Type aliases for cleaner route signatures
JobRepoDep = Annotated[JobRepository, Depends(get_job_repo)]
UserRepoDep = Annotated[UserRepository, Depends(get_user_repo)]
StorageDep = Annotated[StorageService, Depends(get_storage_service)]
OpenAIServiceDep = Annotated[OpenAIService, Depends(get_openai_service)]
SettingsDep = Annotated[Settings, Depends(get_settings)]
DBDep = Annotated[Session, Depends(get_db)]

CurrentUserDep = Annotated[str, Depends(get_current_user_id)]
CurrentExternalIdDep = Annotated[str, Depends(get_current_external_id)]
