from __future__ import annotations

from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.db.base import Base
from app.db.models.user_model import PgEnum

# -----------------------------------------------------------------------------
# Enums
# -----------------------------------------------------------------------------

from app.core.enums import FileRole

if TYPE_CHECKING:
    from .user_model import Org, User
    from .run_model import Run
    from .work_model import Job

# -----------------------------------------------------------------------------
# Models
# -----------------------------------------------------------------------------


class File(Base):
    __tablename__ = "files"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    org_id: Mapped[int] = mapped_column(
        ForeignKey("orgs.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    owner_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    storage_key: Mapped[str] = mapped_column(String(1024), nullable=False, unique=True)

    file_name: Mapped[str] = mapped_column(String(512), nullable=False)

    mime_type: Mapped[str] = mapped_column(String(255), nullable=False)

    size_bytes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    sha256: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    # Unified role for both "what is this file?" and "how is it used in a run?"
    role: Mapped[FileRole] = mapped_column(
        PgEnum(FileRole, name="file_role"),
        nullable=False,
        default=FileRole.INPUT,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    org: Mapped["Org"] = relationship("Org", back_populates="files")

    uploaded_by_user: Mapped["User"] = relationship(
        "User",
        back_populates="uploaded_files",
        foreign_keys=[owner_user_id],
    )

    __table_args__ = (
        Index("ix_files_org_created_at", "org_id", "created_at"),
        Index("ix_files_org_sha256", "org_id", "sha256"),
        Index("ix_files_org_role_created_at", "org_id", "role", "created_at"),
    )

    def __repr__(self) -> str:
        return f"File(id={self.id}, file_name={self.file_name!r}, role={self.role}, org_id={self.org_id})"


class Artefact(Base):
    __tablename__ = "artefacts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    org_id: Mapped[int] = mapped_column(
        ForeignKey("orgs.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    job_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("jobs.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Lineage key: one run => one artefact lineage
    run_id: Mapped[int] = mapped_column(
        ForeignKey("runs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Each new refinement creates a new row with version+1
    version: Mapped[int] = mapped_column(Integer, nullable=False)

    artefact_type: Mapped[str] = mapped_column(
        String(16), nullable=False
    )  # "docx" | "xlsx"
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    file_id: Mapped[int] = mapped_column(
        ForeignKey("files.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    preview_file_id: Mapped[int] = mapped_column(
        ForeignKey("files.id", ondelete="SET NULL"),
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    file: Mapped["File"] = relationship("File", foreign_keys=[file_id])
    preview_file: Mapped[Optional["File"]] = relationship(
        "File", foreign_keys=[preview_file_id]
    )
    run: Mapped["Run"] = relationship("Run", back_populates="artefacts")
    job: Mapped[Optional["Job"]] = relationship("Job", back_populates="artefacts")
    org: Mapped["Org"] = relationship("Org", back_populates="artefacts")

    __table_args__ = (
        UniqueConstraint("run_id", "version", name="uq_artefacts_run_version"),
        CheckConstraint("version >= 1", name="ck_artefacts_version_positive"),
        Index("ix_artefacts_run_version_desc", "run_id", "version"),
        Index("ix_artefacts_job_created_at", "job_id", "created_at"),
    )
