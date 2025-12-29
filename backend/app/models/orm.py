# app/models/orm.py
import enum
import uuid
import datetime as dt

from sqlalchemy import (
    String,
    Text,
    Integer,
    DateTime,
    Enum,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.db import Base


class JobStatus(enum.Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


# --- Core tables --------------------------------------------------


class Organisation(Base):
    __tablename__ = "organisations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    name: Mapped[str] = mapped_column(String, nullable=False)

    created_at: Mapped[dt.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    users: Mapped[list["User"]] = relationship(
        back_populates="organisation",
        cascade="all, delete-orphan",
    )

    templates: Mapped[list["OrganisationTemplate"]] = relationship(
        back_populates="organisation",
        cascade="all, delete-orphan",
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # External identity from Auth0 (or other IdP)
    external_id: Mapped[str] = mapped_column(String, unique=True, nullable=False)

    org_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organisations.id"),
        nullable=True,
    )

    username: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)

    created_at: Mapped[dt.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    organisation: Mapped[Organisation] = relationship(back_populates="users")

    documents: Mapped[list["Document"]] = relationship(
        back_populates="owner_user",
        cascade="all, delete-orphan",
    )

    jobs: Mapped[list["Job"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    org_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organisations.id"),
        nullable=True,
    )

    owner_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
    )

    name: Mapped[str] = mapped_column(String, nullable=False)
    file_url: Mapped[str] = mapped_column(Text, nullable=False)
    mime_type: Mapped[str] = mapped_column(String, nullable=False)

    created_at: Mapped[dt.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # For template documents only:
    generation_prompt: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        doc="LLM prompt describing how to generate docs for this template",
    )

    template_description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        doc="Natural-language description of the template extracted by LLM",
    )

    prompt_version: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        server_default="1",
        doc="Increment whenever you significantly change generation_prompt",
    )

    # Relationships
    owner_user: Mapped[User | None] = relationship(back_populates="documents")
    organisation: Mapped[Organisation | None] = relationship()

    # jobs where this is the template
    template_jobs: Mapped[list["Job"]] = relationship(
        back_populates="template",
        foreign_keys="Job.template_id",
    )


# --- Template sharing across organisations ------------------------


class OrganisationTemplate(Base):
    """
    Join table: which organisations can use which template documents.
    """

    __tablename__ = "organisation_templates"
    __table_args__ = (
        UniqueConstraint("org_id", "template_id", name="uix_org_template"),
    )

    org_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organisations.id"),
        primary_key=True,
    )
    template_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id"),
        primary_key=True,
    )

    shared_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
    )

    shared_at: Mapped[dt.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    organisation: Mapped[Organisation] = relationship(back_populates="templates")
    template: Mapped[Document] = relationship()


# --- Jobs + context files per job ---------------------------------


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    org_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organisations.id"),
        nullable=True,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )

    template_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id"),
        nullable=False,
    )

    status: Mapped[JobStatus] = mapped_column(
        Enum(JobStatus, name="job_status"),
        nullable=False,
        default=JobStatus.pending,
        server_default=JobStatus.pending.value,
    )

    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[dt.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    started_at: Mapped[dt.datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    completed_at: Mapped[dt.datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    user: Mapped[User] = relationship(back_populates="jobs")
    template: Mapped[Document] = relationship(
        foreign_keys=[template_id],
        back_populates="template_jobs",
    )

    # Store S3 URLs for context files directly on the job for simplicity
    context_s3_urls: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False,
        default=list,
        server_default="[]",
    )

    prompt_used: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        doc="Copy of the generation prompt used for this job",
    )

    prompt_version_used: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        doc="Version of the template prompt used when this job ran",
    )

    preview_pdf_document_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id"),
        nullable=True,
    )
    
    preview_pdf_document_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        doc="Storage key/URL for the preview PDF document",
    )

    output_document_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id"),
        nullable=True,
    )

    output_document_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        doc="Storage key/URL for the generated document",
    )

    # Async Polling Support
    progress: Mapped[int] = mapped_column(
        Integer,
        default=0,
        server_default="0",
        nullable=False,
        doc="Percentage progress (0-100)",
    )

    logs: Mapped[list[str]] = mapped_column(
        JSON,
        default=list,
        server_default="[]",
        nullable=False,
        doc="List of log messages for the user",
    )

    preview_pdf: Mapped[Document | None] = relationship(
        foreign_keys=[preview_pdf_document_id]
    )

    output_document: Mapped[Document | None] = relationship(
        foreign_keys=[output_document_id]
    )
