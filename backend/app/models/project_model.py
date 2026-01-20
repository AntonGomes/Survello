from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Any
from enum import Enum
from uuid import uuid4
from pydantic import BaseModel
from sqlmodel import SQLModel, Field, Relationship, AutoString
from sqlalchemy import JSON, Column


if TYPE_CHECKING:
    from .user_model import User
    from .job_model import Job
    from .file_model import File


class ProjectStatus(str, Enum):
    PLANNED = "planned"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class FeeType(str, Enum):
    FIXED = "fixed"
    HOURLY = "hourly"
    MIXED = "mixed"


# -----------------------------------------------------------------------------
# PROJECT UPDATE (Structured update item for the updates JSON array)
# -----------------------------------------------------------------------------


class ProjectUpdateItem(BaseModel):
    """A single update entry in the project updates feed."""

    id: str = Field(default_factory=lambda: str(uuid4()))
    text: str
    author_id: int
    author_name: str | None = None  # Denormalized for display
    author_initials: str | None = None  # Denormalized for display
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    time_entry_id: int | None = (
        None  # Links to a time entry if this update was from time tracking
    )


# -----------------------------------------------------------------------------
# PROJECT (Moved before ProjectType)
# -----------------------------------------------------------------------------


class ProjectBase(SQLModel):
    name: str = Field(max_length=255)
    description: str | None = Field(default=None, sa_type=AutoString)
    rate: float | None = 0.0
    forecasted_billable_hours: float | None = 0.0
    actual_hours: float | None = 0.0
    contingency_percentage: float | None = 0.0
    forecasted_settlement_amount: float | None = 0.0
    final_settlement_amount: float | None = 0.0
    forecasted_fee_amount: float | None = 0.0
    fee_type: FeeType
    status: ProjectStatus | None = Field(default=None, sa_type=AutoString)
    # Unified updates feed - stores list of ProjectUpdateItem dicts
    updates: List[dict[str, Any]] | None = Field(default=None, sa_column=Column(JSON))
    deadline: datetime | None = Field(default=None)


class Project(ProjectBase, table=True):
    __tablename__ = "projects"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)},
    )

    org_id: int = Field(foreign_key="orgs.id", ondelete="CASCADE")
    created_by_user_id: int = Field(foreign_key="users.id", ondelete="RESTRICT")
    lead_user_id: int | None = Field(
        default=None, foreign_key="users.id", ondelete="SET NULL"
    )
    job_id: int = Field(foreign_key="jobs.id", ondelete="CASCADE")
    project_type_id: int = Field(foreign_key="project_types.id")

    project_type: "ProjectType" = Relationship(back_populates="projects")
    job: "Job" = Relationship(back_populates="projects")
    created_by_user: "User" = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Project.created_by_user_id]"}
    )
    lead_user: "User" = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Project.lead_user_id]"}
    )
    files: list["File"] = Relationship(back_populates="project")


class ProjectCreate(ProjectBase):
    lead_user_id: int | None = None
    job_id: int
    project_type_id: int | None = None


class ProjectUpdate(SQLModel):
    name: str | None = None
    description: str | None = None
    rate: float | None = None
    forecasted_billable_hours: float | None = None
    actual_hours: float | None = None
    contingency_percentage: float | None = None
    forecasted_settlement_amount: float | None = None
    final_settlement_amount: float | None = None
    forecasted_fee_amount: float | None = None
    fee_type: FeeType | None = None
    status: ProjectStatus | None = None
    updates: List[dict[str, Any]] | None = None
    deadline: datetime | None = None
    lead_user_id: int | None = None


class ProjectAddUpdate(SQLModel):
    """Request body for adding an update to a project."""

    text: str
    time_entry_id: int | None = None


class ProjectRead(ProjectBase):
    id: int
    project_type_id: int
    job_id: int
    lead_user_id: int | None = None
    created_at: datetime
    updated_at: datetime


# -----------------------------------------------------------------------------
# PROJECT TYPE
# -----------------------------------------------------------------------------


class ProjectTypeBase(SQLModel):
    name: str = Field(max_length=255)
    description: str | None
    rate: float | None = 0.0
    default_fee_type: FeeType | None = FeeType.FIXED
    default_contingency_percentage: float | None = 0.0


class ProjectType(ProjectTypeBase, table=True):
    __tablename__ = "project_types"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)},
    )

    org_id: int | None = Field(default=None, foreign_key="orgs.id", ondelete="CASCADE")

    projects: List["Project"] = Relationship(back_populates="project_type")


class ProjectTypeRead(ProjectTypeBase):
    id: int
    created_at: datetime
    updated_at: datetime


class ProjectTypeCreate(ProjectTypeBase):
    pass


class ProjectReadWithProjectType(ProjectRead):
    project_type: ProjectTypeRead
