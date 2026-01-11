from __future__ import annotations
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship, AutoString

if TYPE_CHECKING:
    from .user_model import User, Org
    from .client_model import Client


class JobStatus(str, Enum):
    PLANNED = "planned"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


# -----------------------------------------------------------------------------
# JOB
# -----------------------------------------------------------------------------


class JobBase(SQLModel):
    name: str = Field(max_length=255)
    address: str | None = Field(default=None, sa_type=AutoString)
    status: JobStatus | None = Field(default=None, sa_type=AutoString)


class Job(JobBase, table=True):
    __tablename__ = "jobs"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)},
    )

    # FKs
    org_id: int = Field(foreign_key="orgs.id", ondelete="CASCADE")
    client_id: int = Field(foreign_key="clients.id", ondelete="RESTRICT")
    created_by_user_id: int = Field(foreign_key="users.id", ondelete="RESTRICT")
    lead_user_id: int | None = Field(
        default=None, foreign_key="users.id", ondelete="SET NULL"
    )

    # Relations
    org: Org = Relationship(back_populates="jobs")
    client: Client = Relationship(back_populates="jobs")
    created_by_user: User = Relationship(
        back_populates="created_jobs",
        sa_relationship_kwargs={"foreign_keys": "[Job.created_by_user_id]"},
    )
    lead_user: User = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Job.lead_user_id]"}
    )


class JobCreate(JobBase):
    client_id: int
    lead_user_id: int | None = None


class JobUpdate(SQLModel):
    name: str | None
    address: str | None
    status: JobStatus | None
    client_id: int | None
    lead_user_id: int | None


class JobRead(JobBase):
    id: int
    client_id: int
    created_by_user_id: int
    lead_user_id: int | None
    created_at: datetime
    updated_at: datetime
