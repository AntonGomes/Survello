from datetime import datetime, timezone
from typing import TYPE_CHECKING
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship, AutoString
from sqlalchemy import JSON, Column

if TYPE_CHECKING:
    from .file_model import File
    from .artefact_model import Artefact


class RunStatus(str, Enum):
    IDLE = "idle"
    PRESIGNING = "presigning"
    UPLOADING = "uploading"
    GENERATING = "generating"
    FINALISING = "finalising"
    COMPLETED = "completed"
    ERROR = "error"


# -----------------------------------------------------------------------------
# RUN FILE LINK (Many-to-Many)
# -----------------------------------------------------------------------------
class RunFileLink(SQLModel, table=True):
    __tablename__ = "run_file_links"  # pyright: ignore[reportAssignmentType]
    run_id: int | None = Field(
        default=None, foreign_key="runs.id", primary_key=True, ondelete="CASCADE"
    )
    file_id: int | None = Field(
        default=None, foreign_key="files.id", primary_key=True, ondelete="CASCADE"
    )


# -----------------------------------------------------------------------------
# RUN
# -----------------------------------------------------------------------------
class RunBase(SQLModel):
    status: RunStatus = Field(default=RunStatus.IDLE, sa_type=AutoString)
    upload_progress: int | None = None
    model_responses: list[str] | None = Field(default=[], sa_column=Column(JSON))


class Run(RunBase, table=True):
    __tablename__ = "runs"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)},
    )

    org_id: int = Field(default=None, foreign_key="orgs.id", ondelete="CASCADE")
    created_by_user_id: int = Field(foreign_key="users.id", ondelete="RESTRICT")
    job_id: int | None = Field(default=None, foreign_key="jobs.id", ondelete="SET NULL")
    template_file_id: int = Field(foreign_key="files.id", ondelete="RESTRICT")

    template_file: "File" = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Run.template_file_id]"}
    )
    context_files: list["File"] = Relationship(
        back_populates="runs",
        link_model=RunFileLink,
    )
    artefacts: list["Artefact"] = Relationship(back_populates="run")


class RunCreate(SQLModel):
    job_id: int | None = None
    template_file_id: int
    context_file_ids: list[int]


class RunRead(RunBase):
    id: int
    created_by_user_id: int
    org_id: int
    template_file_id: int
    job_id: int | None = None
    created_at: datetime
    updated_at: datetime
