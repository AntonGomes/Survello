from datetime import datetime, timezone
from typing import TYPE_CHECKING, List
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship, AutoString
from sqlalchemy import JSON, Column


if TYPE_CHECKING:
    from .user_model import User


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
# PROJECT (Moved before ProjectType)
# -----------------------------------------------------------------------------


class ProjectBase(SQLModel):
    name: str = Field(max_length=255)
    description: str
    rate: float | None = 0.0
    forecasted_billable_hours: float | None = 0.0
    contingency_percentage: float | None = 0.0
    forecasted_settlement_amount: float | None = 0.0
    forecasted_fee_amount: float | None = 0.0
    fee_type: FeeType
    status: ProjectStatus | None = Field(default=None, sa_type=AutoString)
    updates: List[str] | None = Field(default=None, sa_column=Column(JSON))


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
    created_by_user: "User" = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Project.created_by_user_id]"}
    )
    lead_user: "User" = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Project.lead_user_id]"}
    )


class ProjectCreate(ProjectBase):
    lead_user_id: int | None = None
    job_id: int
    project_type_id: int | None = None


class ProjectUpdate(SQLModel):
    name: str | None = None
    description: str | None = None
    rate: float | None = None
    forecasted_billable_hours: float | None = None
    contingency_percentage: float | None = None
    forecasted_settlement_amount: float | None = None
    forecasted_fee_amount: float | None = None
    fee_type: FeeType | None = None
    status: ProjectStatus | None = None
    updates: List[str] | None = None


class ProjectRead(ProjectBase):
    id: int
    project_type_id: int
    created_at: datetime
    updated_at: datetime


# -----------------------------------------------------------------------------
# PROJECT TYPE
# -----------------------------------------------------------------------------


class ProjectTypeBase(SQLModel):
    name: str = Field(max_length=255)
    description: str | None
    rate: float | None = 0.0


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


class ProjectReadWithProjectType(ProjectRead):
    project_type: ProjectTypeRead
