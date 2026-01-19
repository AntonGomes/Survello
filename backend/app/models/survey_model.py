from datetime import datetime, date as date_type, timezone
from typing import TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship, AutoString

if TYPE_CHECKING:
    from .job_model import Job
    from .user_model import User


# -----------------------------------------------------------------------------
# SURVEY
# -----------------------------------------------------------------------------


class SurveyBase(SQLModel):
    date: date_type
    notes: str | None = Field(default=None, sa_type=AutoString)


class Survey(SurveyBase, table=True):
    __tablename__ = "surveys"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)},
    )

    org_id: int = Field(foreign_key="orgs.id", ondelete="CASCADE")
    job_id: int = Field(foreign_key="jobs.id", ondelete="CASCADE")
    surveyor_id: int | None = Field(
        default=None, foreign_key="users.id", ondelete="SET NULL"
    )

    # Relationships
    job: "Job" = Relationship(back_populates="surveys")
    surveyor: "User" = Relationship()
    # Photos are linked via File.survey_id


class SurveyCreate(SurveyBase):
    job_id: int
    surveyor_id: int | None = None


class SurveyUpdate(SQLModel):
    date: date_type | None = None
    notes: str | None = None
    surveyor_id: int | None = None


class SurveyorRead(SQLModel):
    id: int
    name: str


class SurveyRead(SurveyBase):
    id: int
    org_id: int
    job_id: int
    surveyor_id: int | None = None
    surveyor: SurveyorRead | None = None
    created_at: datetime
    updated_at: datetime
    photo_count: int = 0  # Computed field for number of photos
