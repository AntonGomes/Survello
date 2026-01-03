from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel

from app.models.models import FileRead


# -----------------------------------------------------------------------------
# Files
# -----------------------------------------------------------------------------


class GetPresignPutsRequest(BaseModel):
    files: List[FileRead]


class PresignedPut(BaseModel):
    file: FileRead
    put_url: str


class GetPresignPutsResponse(BaseModel):
    puts: List[PresignedPut]


# -----------------------------------------------------------------------------
# User
# -----------------------------------------------------------------------------


class UserUpsertRequest(BaseModel):
    email: str
    name: str


class UserUpsertResponse(BaseModel):
    id: str


# -----------------------------------------------------------------------------
# Run
# -----------------------------------------------------------------------------


class StartRunRequest(BaseModel):
    template: FileRead
    context_files: List[FileRead] = []
    job_id: Optional[int] = None


class StartRunResponse(BaseModel):
    run_id: int


class RunStatusResponse(BaseModel):
    run_id: int
    status: str
    upload_progress: int
    model_responses: List[str]


class LatestArtefactResponse(BaseModel):
    download_url: str
    preview_url: str
