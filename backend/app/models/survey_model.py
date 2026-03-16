from datetime import UTC, datetime
from datetime import date as date_type
from datetime import time as time_type
from enum import Enum
from typing import TYPE_CHECKING, ClassVar, Optional

from sqlmodel import AutoString, Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .file_model import File
    from .instruction_model import Instruction
    from .job_model import Job
    from .user_model import User


# -----------------------------------------------------------------------------
# SURVEY-SURVEYOR LINK TABLE (Many-to-Many)
# -----------------------------------------------------------------------------


class SurveySurveyorLink(SQLModel, table=True):
    """Link table for surveys-to-surveyors many-to-many."""

    __tablename__: ClassVar[str] = "survey_surveyor_links"
    survey_id: int | None = Field(
        default=None, foreign_key="surveys.id", primary_key=True, ondelete="CASCADE"
    )
    user_id: int | None = Field(
        default=None, foreign_key="users.id", primary_key=True, ondelete="CASCADE"
    )


# -----------------------------------------------------------------------------
# WEATHER CONDITIONS ENUM
# -----------------------------------------------------------------------------


class WeatherCondition(str, Enum):
    """Weather conditions for site surveys."""

    SUNNY = "sunny"
    PARTLY_CLOUDY = "partly_cloudy"
    CLOUDY = "cloudy"
    OVERCAST = "overcast"
    LIGHT_RAIN = "light_rain"
    RAIN = "rain"
    HEAVY_RAIN = "heavy_rain"
    SHOWERS = "showers"
    DRIZZLE = "drizzle"
    THUNDERSTORM = "thunderstorm"
    SNOW = "snow"
    SLEET = "sleet"
    HAIL = "hail"
    FOG = "fog"
    MIST = "mist"
    WINDY = "windy"
    CLEAR = "clear"
    FROST = "frost"
    HOT = "hot"
    COLD = "cold"


# -----------------------------------------------------------------------------
# SURVEY
# -----------------------------------------------------------------------------


class SurveyBase(SQLModel):
    """Base fields for a site survey."""

    # When the survey was conducted
    conducted_date: date_type
    conducted_time: time_type | None = None

    # Site observations
    description: str | None = Field(default=None, sa_type=AutoString)
    site_notes: str | None = Field(default=None, sa_type=AutoString)
    weather: str | None = Field(default=None, sa_type=AutoString)  # Free-text weather

    # Legacy field kept for compatibility
    notes: str | None = Field(default=None, sa_type=AutoString)


class Survey(SurveyBase, table=True):
    __tablename__: ClassVar[str] = "surveys"
    id: int | None = Field(default=None, primary_key=True)

    # When the survey data was uploaded/created in the system
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column_kwargs={"onupdate": lambda: datetime.now(UTC)},
    )

    # Foreign keys
    org_id: int = Field(foreign_key="orgs.id", ondelete="CASCADE")
    job_id: int = Field(foreign_key="jobs.id", ondelete="CASCADE")
    instruction_id: int | None = Field(
        default=None, foreign_key="projects.id", ondelete="SET NULL"
    )
    conducted_by_user_id: int | None = Field(
        default=None, foreign_key="users.id", ondelete="SET NULL"
    )
    # Legacy surveyor_id - kept for backward compatibility
    surveyor_id: int | None = Field(
        default=None, foreign_key="users.id", ondelete="SET NULL"
    )

    # Relationships
    job: "Job" = Relationship(back_populates="surveys")
    instruction: Optional["Instruction"] = Relationship()
    conducted_by_user: Optional["User"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Survey.conducted_by_user_id]"}
    )
    surveyor: Optional["User"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Survey.surveyor_id]"}
    )
    # Images and files are linked via File.survey_id
    files: list["File"] = Relationship(back_populates="survey")
    # Many-to-many relationship for surveyors
    surveyors: list["User"] = Relationship(
        link_model=SurveySurveyorLink,
        sa_relationship_kwargs={"lazy": "selectin"},
    )


class SurveyCreate(SQLModel):
    job_id: int
    instruction_id: int | None = None
    conducted_date: date_type
    conducted_time: time_type | None = None
    conducted_by_user_id: int | None = None
    surveyor_ids: list[int] | None = None  # New: list of surveyor user IDs
    site_notes: str | None = None
    description: str | None = None  # New: description field
    weather: str | None = None
    notes: str | None = None  # Legacy


class SurveyUpdate(SQLModel):
    conducted_date: date_type | None = None
    conducted_time: time_type | None = None
    instruction_id: int | None = None
    conducted_by_user_id: int | None = None
    surveyor_ids: list[int] | None = None  # New: list of surveyor user IDs
    site_notes: str | None = None
    description: str | None = None  # New: description field
    weather: str | None = None
    notes: str | None = None  # Legacy


class ConductedByUserRead(SQLModel):
    id: int
    name: str


class InstructionMinimalRead(SQLModel):
    id: int
    name: str


# Backwards compatibility alias
ProjectMinimalRead = InstructionMinimalRead


class SurveyorRead(SQLModel):
    """Legacy - for backward compatibility."""

    id: int
    name: str


class SurveyRead(SurveyBase):
    id: int
    org_id: int
    job_id: int
    instruction_id: int | None = None
    conducted_by_user_id: int | None = None
    conducted_by_user: ConductedByUserRead | None = None
    instruction: InstructionMinimalRead | None = None
    surveyor_id: int | None = None  # Legacy
    surveyor: SurveyorRead | None = None  # Legacy
    surveyors: list[SurveyorRead] = []  # New: list of surveyors
    description: str | None = None  # New: description field
    created_at: datetime
    updated_at: datetime
    photo_count: int = 0  # Computed field for number of photos
    file_count: int = 0  # Computed field for number of attached files
