from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from openai import OpenAI

from app.core.deps import get_db, get_openai_client, get_s3
from app.core.s3 import S3Client
from app.core.settings import Settings, get_settings

from app.schemas.user_schemas import UserRead

from app.repositories.run_repo import RunRepository
from app.repositories.user_repo import UserRepository
from app.repositories.session_repo import SessionRepository
from app.repositories.file_repo import FileRepository
from app.repositories.artefact_repo import ArtefactRepository
from app.repositories.work_repo import WorkRepository

from app.services.storage import StorageService
from app.services.openai_service import OpenAIService

# ---- Service Dependencies --------------------------------------------------


def get_run_repo(db: Session = Depends(get_db)) -> RunRepository:
    return RunRepository(db)


def get_user_repo(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_session_repo(db: Session = Depends(get_db)) -> SessionRepository:
    return SessionRepository(db)


def get_file_repo(db: Session = Depends(get_db)) -> FileRepository:
    return FileRepository(db)


def get_artefact_repo(db: Session = Depends(get_db)) -> ArtefactRepository:
    return ArtefactRepository(db)


def get_work_repo(db: Session = Depends(get_db)) -> WorkRepository:
    return WorkRepository(db)


def get_storage_service(s3: S3Client = Depends(get_s3)) -> StorageService:
    return StorageService(s3)


def get_openai_service(
    client: OpenAI = Depends(get_openai_client),
    settings: Settings = Depends(get_settings),
) -> OpenAIService:
    return OpenAIService(client, settings.openai_api_key)


def get_current_user(
    request: Request, session_repo: SessionRepository = Depends(get_session_repo)
) -> UserRead:
    session_token = request.cookies.get("session_token")
    session = session_repo.get_valid_session(session_token)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session not found or expired.",
        )
    return UserRead(
        id=session.user.id,
        email=session.user.email,
        name=session.user.name,
        role=session.user.role,
        org_id=session.user.org_id,
    )


# Type aliases for cleaner route signatures
RunRepoDep = Annotated[RunRepository, Depends(get_run_repo)]
WorkRepoDep = Annotated[WorkRepository, Depends(get_work_repo)]
UserRepoDep = Annotated[UserRepository, Depends(get_user_repo)]
SessionRepoDep = Annotated[SessionRepository, Depends(get_session_repo)]
FileRepoDep = Annotated[FileRepository, Depends(get_file_repo)]
ArtefactRepoDep = Annotated[ArtefactRepository, Depends(get_artefact_repo)]

OpenAIServiceDep = Annotated[OpenAIService, Depends(get_openai_service)]

StorageDep = Annotated[StorageService, Depends(get_storage_service)]
DBDep = Annotated[Session, Depends(get_db)]
SettingsDep = Annotated[Settings, Depends(get_settings)]

CurrentUserDep = Annotated[UserRead, Depends(get_current_user)]
