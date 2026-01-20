from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .project_model import Project
    from .user_model import User


class TimeEntryBase(SQLModel):
    project_id: int = Field(foreign_key="projects.id")
    start_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_time: datetime | None = None
    description: str | None = None
    duration_minutes: int | None = None  # Computed on stop, stored for reporting
    update_id: str | None = None  # Links to the UUID of the update in project.updates


class TimeEntry(TimeEntryBase, table=True):
    __tablename__ = "time_entries"  # pyright: ignore[reportAssignmentType]

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")

    # Relationships
    project: "Project" = Relationship()
    user: "User" = Relationship()


class TimeEntryCreate(SQLModel):
    project_id: int
    description: str | None = None


class TimeEntryManualCreate(SQLModel):
    """For manually logging time without using the timer."""

    project_id: int
    duration_minutes: int
    description: str | None = None


class TimeEntryRead(TimeEntryBase):
    id: int
    user_id: int


class TimeEntryOut(TimeEntryRead):
    project_name: str
    user_name: str | None = None
