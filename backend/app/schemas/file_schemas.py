from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.core.enums import FileRole


# --------------------------------------
# File Schemas
# --------------------------------------
class FileBase(BaseModel):
    """Shared attributes for File models."""

    file_name: str
    mime_type: str
    role: FileRole

    model_config = ConfigDict(use_enum_values=True, from_attributes=True)


class FilePresign(FileBase):
    """Attributes required to request a presigned URL."""

    pass


class FileInput(FileBase):
    """Attributes for a file that has been uploaded (has a key)."""

    storage_key: str


class FileRead(FileInput):
    """DTO for file metadata passed from frontend to backend services."""

    id: int
    owner_user_id: int
    created_at: Optional[datetime] = None


class FileCreate(FileInput):
    """Attributes required to create a new File record in DB."""

    owner_user_id: int
    org_id: Optional[int] = None


class FileUpdate(BaseModel):
    """Attributes that can be updated on a File."""

    file_name: Optional[str] = None
    mime_type: Optional[str] = None
    role: Optional[FileRole] = None
    storage_key: Optional[str] = None


class FileStore(FileInput):
    """DTO for storing a file and manipulating its content"""

    id: Optional[int] = None
    owner_user_id: Optional[int] = None
    created_at: Optional[datetime] = None

    storage_key: str
    data: Optional[bytes] = None


# --------------------------------------
# API Request/Response Schemas
# --------------------------------------
class GetPresignPutsRequest(BaseModel):
    files: List[FilePresign]


class PresignedPut(BaseModel):
    file: FileInput
    put_url: str


class GetPresignPutsResponse(BaseModel):
    puts: List[PresignedPut]


class RegisterFilesRequest(BaseModel):
    files: List[FileInput]


class RegisterFilesResponse(BaseModel):
    files: List[FileRead]
