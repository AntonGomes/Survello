from datetime import datetime, timezone
from typing import TYPE_CHECKING
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship, AutoString
from .run_model import RunFileLink

if TYPE_CHECKING:
    from .user_model import User
    from .run_model import Run, RunFileLink


class FileRole(str, Enum):
    TEMPLATE = "template"
    PREVIEW_PDF = "preview_pdf"
    ARTEFACT = "artefact"
    INPUT = "input"


class FileBase(SQLModel):
    file_name: str = Field(max_length=512)
    mime_type: str = Field(max_length=255)
    size_bytes: int | None = None


class File(FileBase, table=True):
    __tablename__ = "files"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    storage_key: str = Field(max_length=1024, unique=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    role: FileRole = Field(default=FileRole.INPUT, sa_type=AutoString)

    org_id: int = Field(default=None, foreign_key="orgs.id", ondelete="CASCADE")
    uploaded_by_user_id: int | None = Field(foreign_key="users.id", ondelete="RESTRICT")
    job_id: int | None = Field(default=None, foreign_key="jobs.id", ondelete="SET NULL")
    run_id: int | None = Field(default=None, foreign_key="runs.id", ondelete="SET NULL")

    # Relationships
    uploaded_by_user: "User" = Relationship(back_populates="uploaded_files")
    runs: list["Run"] = Relationship(
        back_populates="context_files", link_model=RunFileLink
    )


class FileCreate(FileBase):
    storage_key: str
    org_id: int
    uploaded_by_user_id: int | None = None
    job_id: int | None = None
    run_id: int | None = None
    role: FileRole = FileRole.INPUT


class FilePresignRequest(FileBase):
    client_id: str


class FilePresignResponse(FileBase):
    client_id: str
    put_url: str
    storage_key: str


class FileUpdate(SQLModel):
    file_name: str | None = None
    role: FileRole | None = None


class FileRead(FileBase):
    id: int
    storage_key: str
    uploaded_by_user_id: int
    created_at: datetime
    role: FileRole
    size_bytes: int | None = None
