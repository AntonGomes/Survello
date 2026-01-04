from __future__ import annotations

from datetime import datetime
from typing import List, Optional, TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, Integer, JSON, func
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.db.base import Base
from app.db.models.user_model import PgEnum
from app.core.enums import FileRole

if TYPE_CHECKING:
    from app.db.models.file_model import File, Artefact
    from app.db.models.work_model import Job
    from app.db.models.user_model import User, Org

# -----------------------------------------------------------------------------
# Enums
# -----------------------------------------------------------------------------

from app.core.enums import RunStatus

# -----------------------------------------------------------------------------
# Models
# -----------------------------------------------------------------------------


class Run(Base):
    __tablename__ = "runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    org_id: Mapped[int] = mapped_column(
        ForeignKey("orgs.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    created_by_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    job_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("jobs.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    status: Mapped[RunStatus] = mapped_column(
        PgEnum(RunStatus, name="run_status"),
        nullable=False,
        default=RunStatus.IDLE,
    )

    upload_progress: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # list of model responses (text) captured during generation
    model_responses: Mapped[list[str]] = mapped_column(
        JSON,
        default=list,
        server_default="[]",
        nullable=False,
        doc="List of model responses for the user",
    )

    # Relationships

    org: Mapped["Org"] = relationship("Org", back_populates="runs")

    created_by_user: Mapped["User"] = relationship(
        "User",
        back_populates="created_runs",
        foreign_keys=[created_by_user_id],
    )

    job: Mapped[Optional["Job"]] = relationship("Job", back_populates="runs")

    run_files: Mapped[List["RunFile"]] = relationship(
        back_populates="run",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    artefacts: Mapped[List["Artefact"]] = relationship("Artefact", back_populates="run")

    __table_args__ = (
        Index("ix_runs_org_created_at", "org_id", "created_at"),
        Index("ix_runs_job_created_at", "job_id", "created_at"),
    )

    def __repr__(self) -> str:
        return f"Run(id={self.id}, status={self.status}, org_id={self.org_id}, job_id={self.job_id})"


# Join Table: RunFile
class RunFile(Base):
    """
    Association object: a file attached to a run.
    Uses the same FileRole enum as File.role for consistency.
    """

    __tablename__ = "run_files"

    run_id: Mapped[int] = mapped_column(
        ForeignKey("runs.id", ondelete="CASCADE"),
        primary_key=True,
    )

    file_id: Mapped[int] = mapped_column(
        ForeignKey("files.id", ondelete="CASCADE"),
        primary_key=True,
    )

    role: Mapped[FileRole] = mapped_column(
        PgEnum(FileRole, name="file_role"),  # shared enum type name
        nullable=False,
        default=FileRole.INPUT,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    run: Mapped["Run"] = relationship(back_populates="run_files")
    file: Mapped["File"] = relationship("File")

    __table_args__ = (Index("ix_run_files_run_role", "run_id", "role"),)

    def __repr__(self) -> str:
        return (
            f"RunFile(run_id={self.run_id}, file_id={self.file_id}, role={self.role})"
        )
