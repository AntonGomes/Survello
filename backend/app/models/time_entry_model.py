from datetime import datetime, timezone
from sqlmodel import SQLModel, Field


class TimeEntryBase(SQLModel):
    project_id: int = Field(foreign_key="projects.id")
    start_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_time: datetime | None = None
    description: str | None = None


class TimeEntry(TimeEntryBase, table=True):
    __tablename__ = "time_entries"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")


class TimeEntryCreate(SQLModel):
    project_id: int
    description: str | None = None


class TimeEntryRead(TimeEntryBase):
    id: int
    user_id: int
    duration_minutes: int | None = None


class TimeEntryOut(TimeEntryRead):
    project_name: str
