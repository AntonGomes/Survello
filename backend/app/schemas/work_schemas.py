from typing import Optional, List
from pydantic import BaseModel

from app.schemas.org_schemas import OrgRead
from app.schemas.client_schemas import ClientRead
from app.schemas.user_schemas import UserRead

from app.core.enums import FileRole, JobStatus, ProjectStatus, FeeType
from app.schemas.file_schemas import FileBase, FileRead


# --------------------------------------
# Project Type Schemas
# --------------------------------------
class ProjectTypeBase(BaseModel):
    """Shared attributes for ProjectType models."""

    pass


class ProjectTypeRead(ProjectTypeBase):
    """For reading ProjectType metadata."""

    id: int
    name: str
    description: Optional[str]
    rate: Optional[float] = None


# --------------------------------------
# Job File Schemas
# --------------------------------------
class JobFileBase(FileBase):
    pass


class JobFileRead(JobFileBase):
    """For reading JobFile data, we always want full file data."""

    id: int
    job_id: int
    file: FileRead
    added_by_user_name: str
    role: FileRole
    created_at: str


class JobFileCreate(JobFileBase):
    """For adding files to a Job."""

    file: FileRead
    added_by_user_id: int


# --------------------------------------
# Project Schemas
# --------------------------------------
class ProjectBase(BaseModel):
    """Shared attributes for Project models."""

    pass


class ProjectRead(ProjectBase):
    """For reading Project metadata."""

    id: int
    name: str
    job_id: int
    job_name: str
    project_type_id: int
    project_type_name: str
    description: Optional[str]
    created_at: str
    updated_at: Optional[str]
    status: Optional[ProjectStatus]


class ProjectCreate(ProjectBase):
    """For creating new Projects."""

    job_id: int
    name: str
    project_type_id: Optional[int] = None
    description: Optional[str] = None
    rate: Optional[float] = None
    forecasted_billable_hours: Optional[float] = None
    contingency_percentage: Optional[float] = None
    forecasted_settlement_amount: Optional[float] = None
    forecasted_fee_amount: Optional[float] = None
    fee_type: Optional[FeeType] = None
    status: Optional[ProjectStatus] = None


# --------------------------------------
# Job Schemas
# --------------------------------------
class JobBase(BaseModel):
    """Shared attributes for Job models."""

    org_id: int
    client_id: int
    created_by_user_id: int
    name: str


class JobRead(JobBase):
    """For reading Job metadata. E.g. in a list or table view,"""

    id: int
    lead_user_id: Optional[int]
    address: Optional[str]
    status: Optional[str]
    created_at: str
    updated_at: Optional[str]
    client: ClientRead


class JobCreate(JobBase):
    """For creating new Jobs."""

    lead_user_id: Optional[int] = None
    address: Optional[str] = None
    status: Optional[JobStatus] = None


class JobDetailRead(JobRead):
    """For reading nested Job data, E.g. in a full page job view"""

    org: OrgRead
    client: ClientRead
    created_by_user: UserRead
    lead_user: Optional[UserRead]
    projects: List[ProjectRead] = []
    job_files: List[JobFileRead] = []


# --------------------------------------
# Extended Project Schemas (Dependent on Job)
# --------------------------------------
class ProjectDetailRead(ProjectRead):
    """For reading nested Project data."""

    job: JobRead
    project_type: ProjectTypeRead
    # runs: List[RunRead] = []  # TODO: Tie runs to projects instead of jobs
    rate: Optional[float] = None
    forecasted_billable_hours: Optional[float] = None
    contingency_percentage: Optional[float] = None
    forecasted_settlement_amount: Optional[float] = None
    forecasted_fee_amount: Optional[float] = None
    fee_type: Optional[FeeType] = None
