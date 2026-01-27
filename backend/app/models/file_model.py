from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional, ClassVar
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship, AutoString
from .run_model import RunFileLink

if TYPE_CHECKING:
    from .user_model import User
    from .run_model import Run, RunFileLink
    from .job_model import Job
    from .instruction_model import Instruction
    from .survey_model import Survey


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
    __tablename__: ClassVar[str] = "files"
    id: int | None = Field(default=None, primary_key=True)
    storage_key: str = Field(max_length=1024, unique=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    role: FileRole = Field(default=FileRole.INPUT, sa_type=AutoString)

    org_id: int = Field(default=None, foreign_key="orgs.id", ondelete="CASCADE")
    uploaded_by_user_id: int | None = Field(foreign_key="users.id", ondelete="RESTRICT")
    job_id: int | None = Field(default=None, foreign_key="jobs.id", ondelete="SET NULL")
    run_id: int | None = Field(default=None, foreign_key="runs.id", ondelete="SET NULL")
    survey_id: int | None = Field(
        default=None, foreign_key="surveys.id", ondelete="SET NULL"
    )
    # New: link files directly to instructions (formerly projects)
    instruction_id: int | None = Field(
        default=None, foreign_key="projects.id", ondelete="SET NULL"
    )
    # New: link to PDF preview file (for docx/xlsx files)
    preview_file_id: int | None = Field(
        default=None, foreign_key="files.id", ondelete="SET NULL"
    )

    # Relationships
    uploaded_by_user: "User" = Relationship(back_populates="uploaded_files")
    job: "Job" = Relationship(back_populates="files")
    runs: list["Run"] = Relationship(
        back_populates="context_files", link_model=RunFileLink
    )
    instruction: Optional["Instruction"] = Relationship(back_populates="files")
    survey: Optional["Survey"] = Relationship(back_populates="files")
    # Self-referential for preview file
    preview_file: Optional["File"] = Relationship(
        sa_relationship_kwargs={
            "remote_side": "File.id",
            "foreign_keys": "[File.preview_file_id]",
        }
    )


class FileCreate(FileBase):
    storage_key: str
    org_id: int
    uploaded_by_user_id: int | None = None
    job_id: int | None = None
    run_id: int | None = None
    instruction_id: int | None = None
    survey_id: int | None = None
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
    preview_file_id: int | None = None
    job_id: int | None = None
    instruction_id: int | None = None
    survey_id: int | None = None


class FileRead(FileBase):
    id: int
    storage_key: str
    uploaded_by_user_id: int
    created_at: datetime
    role: FileRole
    size_bytes: int | None = None
    job_id: int | None = None
    instruction_id: int | None = None
    survey_id: int | None = None
    preview_file_id: int | None = None
