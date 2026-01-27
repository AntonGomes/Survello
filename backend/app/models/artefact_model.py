from __future__ import annotations
from datetime import datetime, timezone
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship, AutoString
from typing import TYPE_CHECKING, ClassVar

if TYPE_CHECKING:
    from .file_model import File
    from .run_model import Run


class ArtefactType(str, Enum):
    DOCX = ".docx"
    XLSX = ".xlsx"


class ArtefactBase(SQLModel):
    artefact_type: ArtefactType = Field(sa_type=AutoString)
    title: str | None = Field(default=None, max_length=255)
    version: int


class Artefact(ArtefactBase, table=True):
    __tablename__: ClassVar[str] = "artefacts"
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    org_id: int = Field(default=None, foreign_key="orgs.id", ondelete="CASCADE")
    job_id: int | None = Field(default=None, foreign_key="jobs.id", ondelete="SET NULL")
    run_id: int = Field(foreign_key="runs.id", ondelete="CASCADE")
    file_id: int = Field(foreign_key="files.id", ondelete="RESTRICT")
    preview_file_id: int | None = Field(
        default=None, foreign_key="files.id", ondelete="SET NULL"
    )

    file: File = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Artefact.file_id]"}
    )
    preview_file: File = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Artefact.preview_file_id]"}
    )
    run: Run = Relationship(back_populates="artefacts")


class ArtefactCreate(ArtefactBase):
    run_id: int
    file_id: int
    preview_file_id: int
    org_id: int
    job_id: int | None = None
