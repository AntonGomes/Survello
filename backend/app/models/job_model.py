from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Any
from enum import Enum
from app.models.client_model import ClientReadMinimal, Client
from app.models.user_model import UserRead, User, Org
from app.models.project_model import Project, ProjectReadWithProjectType
from app.models.file_model import FileRead, File
from sqlmodel import SQLModel, Field, Relationship, AutoString
from sqlalchemy import JSON, Column

if TYPE_CHECKING:
    from .survey_model import Survey


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
    # Unified updates feed - stores list of UpdateItem dicts
    # (see update_model.py for structure)
    updates: List[Any] | None = Field(default=None, sa_column=Column(JSON))


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
    projects: list[Project] = Relationship(back_populates="job")
    files: list[File] = Relationship(back_populates="job")
    surveys: list["Survey"] = Relationship(back_populates="job")


class JobCreate(JobBase):
    client_id: int
    lead_user_id: int | None = None


class JobUpdate(SQLModel):
    name: str | None = None
    address: str | None = None
    status: JobStatus | None = None
    client_id: int | None = None
    lead_user_id: int | None = None
    updates: List[Any] | None = None


class JobRead(JobBase):
    id: int
    client: ClientReadMinimal
    created_by_user: UserRead
    lead_user: UserRead | None
    created_at: datetime
    updated_at: datetime
    updates: List[Any] | None = None
    projects: list["ProjectReadWithProjectType"] = []


class JobReadDetail(JobRead):
    projects: list["ProjectReadWithProjectType"]
    files: list[FileRead]
