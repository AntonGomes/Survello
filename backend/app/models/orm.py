# backend/app/models/orm.py
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    JSON,
    func
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
)
from sqlalchemy.types import Enum as SAEnum 


# -----------------------------------------------------------------------------
# Base
# -----------------------------------------------------------------------------


class Base(DeclarativeBase):
    pass


# -----------------------------------------------------------------------------
# Enums
# -----------------------------------------------------------------------------

def PgEnum(enum_cls, name: str):
    return SAEnum(
        enum_cls,
        name=name,
        values_callable=lambda e: [m.value for m in e],
        native_enum=True,
        validate_strings=True,
    )


class UserRole(str, Enum):
    MEMBER = "member"
    ADMIN = "admin"


class RunStatus(str, Enum):
    IDLE = "idle"
    PRESIGNING = "presigning"
    UPLOADING = "uploading"
    GENERATING = "generating"
    COMPLETED = "completed"
    ERROR = "error"


class FileRole(str, Enum):
    TEMPLATE = "template"
    PREVIEW_PDF = "preview_pdf"
    ARTEFACT = "artefact"
    INPUT = "input"


class ArtefactType(str, Enum):
    DOCX = "docx"
    XLSX = "xlsx"


# -----------------------------------------------------------------------------
# Core tables
# -----------------------------------------------------------------------------


class Org(Base):
    __tablename__ = "orgs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    users: Mapped[List["User"]] = relationship(
        back_populates="org",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    clients: Mapped[List["Client"]] = relationship(back_populates="org")
    jobs: Mapped[List["Job"]] = relationship(back_populates="org")
    runs: Mapped[List["Run"]] = relationship(back_populates="org")
    files: Mapped[List["File"]] = relationship(back_populates="org")
    artefacts: Mapped[List["Artefact"]] = relationship(back_populates="org")

    def __repr__(self) -> str:
        return f"Org(id={self.id}, name={self.name!r})"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    org_id: Mapped[int] = mapped_column(
        ForeignKey("orgs.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(
        String(320), nullable=False, unique=True, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=True) # for now till new auth 

    # External identity from Auth0 (or other IdP)
    external_id: Mapped[str] = mapped_column(String, unique=True, nullable=False)

    role: Mapped[UserRole] = mapped_column(
        PgEnum(UserRole, name="user_role"),
        nullable=False,
        default=UserRole.MEMBER,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    org: Mapped["Org"] = relationship(back_populates="users")

    created_jobs: Mapped[List["Job"]] = relationship(
        back_populates="created_by_user",
        foreign_keys="Job.created_by_user_id",
    )
    created_runs: Mapped[List["Run"]] = relationship(
        back_populates="created_by_user",
        foreign_keys="Run.created_by_user_id",
    )
    uploaded_files: Mapped[List["File"]] = relationship(
        back_populates="uploaded_by_user",
        foreign_keys="File.owner_user_id",
    )

    def __repr__(self) -> str:
        return f"User(id={self.id}, email={self.email!r}, org_id={self.org_id})"

class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    session_token: Mapped[str] = mapped_column(String(512), nullable=False, unique=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="sessions")

    def __repr__(self) -> str:
        return f"Session(id={self.id}, user_id={self.user_id}, expires_at={self.expires_at})"


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    org_id: Mapped[int] = mapped_column(
        ForeignKey("orgs.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

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
    org: Mapped["Org"] = relationship(back_populates="clients")
    jobs: Mapped[List["Job"]] = relationship(back_populates="client")

    contacts: Mapped[List["ClientContact"]] = relationship(
        back_populates="client",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    __table_args__ = (Index("ix_clients_org_name", "org_id", "name"),)

    def __repr__(self) -> str:
        return f"Client(id={self.id}, name={self.name!r}, org_id={self.org_id})"


class ClientContact(Base):
    __tablename__ = "client_contacts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    client_id: Mapped[int] = mapped_column(
        ForeignKey("clients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(320), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    role_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    client: Mapped["Client"] = relationship(back_populates="contacts")

    def __repr__(self) -> str:
        return f"ClientContact(id={self.id}, client_id={self.client_id}, name={self.name!r})"


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

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

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    status: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

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
    org: Mapped["Org"] = relationship(back_populates="jobs")
    client: Mapped["Client"] = relationship(back_populates="jobs")
    created_by_user: Mapped["User"] = relationship(
        back_populates="created_jobs",
        foreign_keys=[created_by_user_id],
    )

    runs: Mapped[List["Run"]] = relationship(back_populates="job")
    job_files: Mapped[List["JobFile"]] = relationship(
        back_populates="job",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    artefacts: Mapped[List["Artefact"]] = relationship(back_populates="job")

    __table_args__ = (
        Index("ix_jobs_org_created_at", "org_id", "created_at"),
        Index("ix_jobs_org_client", "org_id", "client_id"),
    )

    def __repr__(self) -> str:
        return f"Job(id={self.id}, name={self.name!r}, org_id={self.org_id}, client_id={self.client_id})"


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

    org: Mapped["Org"] = relationship(back_populates="runs")

    created_by_user: Mapped["User"] = relationship(
        back_populates="created_runs",
        foreign_keys=[created_by_user_id],
    )

    job: Mapped[Optional["Job"]] = relationship(back_populates="runs")

    run_files: Mapped[List["RunFile"]] = relationship(
        back_populates="run",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    artefacts: Mapped[List["Artefact"]] = relationship(back_populates="run")

    __table_args__ = (
        Index("ix_runs_org_created_at", "org_id", "created_at"),
        Index("ix_runs_job_created_at", "job_id", "created_at"),
    )

    def __repr__(self) -> str:
        return f"Run(id={self.id}, status={self.status}, org_id={self.org_id}, job_id={self.job_id})"


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
    org: Mapped["Org"] = relationship(back_populates="files")
    uploaded_by_user: Mapped["User"] = relationship(
        back_populates="uploaded_files",
        foreign_keys=[owner_user_id],
    )

    job_links: Mapped[List["JobFile"]] = relationship(back_populates="file")
    run_links: Mapped[List["RunFile"]] = relationship(back_populates="file")

    __table_args__ = (
        Index("ix_files_org_created_at", "org_id", "created_at"),
        Index("ix_files_org_sha256", "org_id", "sha256"),
        Index("ix_files_org_role_created_at", "org_id", "role", "created_at"),
    )

    def __repr__(self) -> str:
        return f"File(id={self.id}, file_name={self.file_name!r}, role={self.role}, org_id={self.org_id})"


# -----------------------------------------------------------------------------
# Join Tables / Association Objects
# -----------------------------------------------------------------------------


# Join Table: JobFile
class JobFile(Base):
    """
    Association object: a file attached to a job, with metadata about the attachment.
    """

    __tablename__ = "job_files"

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

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    job: Mapped["Job"] = relationship(back_populates="job_files")
    file: Mapped["File"] = relationship(back_populates="job_links")

    def __repr__(self) -> str:
        return f"JobFile(job_id={self.job_id}, file_id={self.file_id})"


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
    file: Mapped["File"] = relationship(back_populates="run_links")

    __table_args__ = (Index("ix_run_files_run_role", "run_id", "role"),)

    def __repr__(self) -> str:
        return (
            f"RunFile(run_id={self.run_id}, file_id={self.file_id}, role={self.role})"
        )


# -----------------------------------------------------------------------------
# Artefacts and versioning
# -----------------------------------------------------------------------------


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
    job: Mapped[Optional["Job"]] = relationship("Job")
    org: Mapped["Org"] = relationship("Org")

    __table_args__ = (
        UniqueConstraint("run_id", "version", name="uq_artefacts_run_version"),
        CheckConstraint("version >= 1", name="ck_artefacts_version_positive"),
        Index("ix_artefacts_run_version_desc", "run_id", "version"),
        Index("ix_artefacts_job_created_at", "job_id", "created_at"),
    )
