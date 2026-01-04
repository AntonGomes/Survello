from __future__ import annotations

from datetime import datetime
from typing import List, Optional, TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)
from app.core.enums import ProjectStatus, FeeType

from app.db.base import Base

if TYPE_CHECKING:
    from .user_model import Org, User
    from .client_model import Client
    from .run_model import Run
    from .file_model import Artefact, File


class Job(Base):
    __tablename__ = "jobs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Foreign Keys

    org_id: Mapped[int] = mapped_column(
        ForeignKey("orgs.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    client_id: Mapped[int] = mapped_column(
        ForeignKey("clients.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    created_by_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    lead_user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Other Columns

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[Optional[ProjectStatus]] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships

    org: Mapped["Org"] = relationship("Org", back_populates="jobs")
    client: Mapped["Client"] = relationship(back_populates="jobs")
    created_by_user: Mapped["User"] = relationship(
        "User",
        back_populates="created_jobs",
        foreign_keys=[created_by_user_id],
    )

    runs: Mapped[List["Run"]] = relationship("Run", back_populates="job")
    job_files: Mapped[List["JobFile"]] = relationship(
        back_populates="job",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    artefacts: Mapped[List["Artefact"]] = relationship("Artefact", back_populates="job")

    __table_args__ = (
        Index("ix_jobs_org_created_at", "org_id", "created_at"),
        Index("ix_jobs_org_client", "org_id", "client_id"),
    )

    def __repr__(self) -> str:
        return f"Job(id={self.id}, name={self.name!r}, org_id={self.org_id}, client_id={self.client_id})"


# Join Table: JobFile
class JobFile(Base):
    """
    Association object: a file attached to a job, with metadata about the attachment.
    """

    __tablename__ = "job_files"

    # Foreign Keys

    job_id: Mapped[int] = mapped_column(
        ForeignKey("jobs.id", ondelete="CASCADE"),
        primary_key=True,
    )
    file_id: Mapped[int] = mapped_column(
        ForeignKey("files.id", ondelete="CASCADE"),
        primary_key=True,
    )

    added_by_user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Other Columns

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships

    job: Mapped["Job"] = relationship(back_populates="job_files")
    file: Mapped["File"] = relationship("File")

    def __repr__(self) -> str:
        return f"JobFile(job_id={self.job_id}, file_id={self.file_id})"


class Project(Base):
    __tablename__ = "projects"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Foreign Keys

    org_id: Mapped[int] = mapped_column(
        ForeignKey("orgs.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    job_id: Mapped[int] = mapped_column(
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    project_type_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("project_types.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Other Columns

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    updates: Mapped[Optional[List[str]]] = mapped_column(Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rate: Mapped[Optional[float]] = mapped_column(Integer, nullable=True)
    forecasted_billable_hours: Mapped[Optional[float]] = mapped_column(
        Integer, nullable=True
    )
    contingency_percentage: Mapped[Optional[float]] = mapped_column(
        Integer, nullable=True
    )
    forecasted_settlement_amount: Mapped[Optional[float]] = mapped_column(
        Integer, nullable=True
    )
    forecasted_fee_amount: Mapped[Optional[float]] = mapped_column(
        Integer, nullable=True
    )
    fee_type: Mapped[Optional[FeeType]] = mapped_column(String(64), nullable=True)
    status: Mapped[Optional[ProjectStatus]] = mapped_column(String(64), nullable=True)

    # Relationships
    org: Mapped["Org"] = relationship("Org", back_populates="projects")
    # TODO: Tie runs to projects instead of jobs

    def __repr__(self) -> str:
        return f"Project(id={self.id}, name={self.name!r}, org_id={self.org_id})"


class ProjectType(Base):
    __tablename__ = "project_types"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Foreign Keys
    org_id: Mapped[int] = mapped_column(
        ForeignKey("orgs.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    # Other Columns
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rate: Mapped[Optional[float]] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"ProjectType(id={self.id}, name={self.name!r})"
