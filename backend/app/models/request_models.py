from __future__ import annotations

from typing import List

from pydantic import BaseModel


class UserUpsertRequest(BaseModel):
    email: str
    name: str


class UserUpsertResponse(BaseModel):
    id: str


class PresignFileRequest(BaseModel):
    name: str
    content_type: str
    kind: str  # e.g. "template" or "context"


class PresignUploadsRequest(BaseModel):
    files: List[PresignFileRequest]


class PresignedUpload(BaseModel):
    name: str
    content_type: str
    kind: str
    key: str
    upload_url: str


class PresignUploadsResponse(BaseModel):
    uploads: List[PresignedUpload]


class CreateJobRequest(BaseModel):
    template_file_url: str
    context_file_urls: List[str]


class CreateJobResponse(BaseModel):
    id: str


class DownloadGenDocUrlResponse(BaseModel):
    download_url: str
    preview_url: str


class JobStatusResponse(BaseModel):
    id: str
    status: str
    progress: int
    logs: List[str]
    output_document_url: str | None = None
