from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from app.db.models.work_model import Job, JobFile, Project, ProjectType

from app.schemas.work_schemas import (
    JobCreate,
    JobRead,
    JobDetailRead,
    ProjectCreate,
    ProjectRead,
    ProjectDetailRead,
    ProjectTypeRead,
)


class WorkRepository:
    """Encapsulates all database access related to Jobs."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create_job(self, job_in: JobCreate) -> JobRead:
        job = Job(
            org_id=job_in.org_id,
            client_id=job_in.client_id,
            created_by_user_id=job_in.created_by_user_id,
            name=job_in.name,
            lead_user_id=job_in.lead_user_id,
            address=job_in.address,
            status=job_in.status,
        )
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return JobRead.model_validate(job)

    def get_job(self, job_id: int) -> Optional[JobDetailRead]:
        job = (
            self.db.query(Job)
            .options(
                joinedload(Job.org),
                joinedload(Job.client),
                joinedload(Job.created_by_user),
                joinedload(Job.lead_user),
                joinedload(Job.job_files).joinedload(JobFile.file),
                joinedload(Job.projects).joinedload(Project.project_type),
            )
            .filter(Job.id == job_id)
            .first()
        )
        if not job:
            return None
        return JobDetailRead.model_validate(job)

    def get_jobs_by_user(self, user_id: int, start: int, end: int) -> List[JobRead]:
        """Get jobs created by a specific user with pagination."""
        jobs = (
            self.db.query(Job)
            .options(joinedload(Job.client))
            .filter(Job.created_by_user_id == user_id)
            .order_by(Job.created_at.desc())
            .slice(start, end)
            .all()
        )
        return [JobRead.model_validate(job) for job in jobs]

    def create_project(self, project_in: ProjectCreate) -> ProjectRead:
        # Fetch job to get org_id
        job = self.db.query(Job).filter(Job.id == project_in.job_id).first()
        org_id = job.org_id if job else None

        project = Project(
            job_id=project_in.job_id,
            org_id=org_id,
            name=project_in.name,
            project_type_id=project_in.project_type_id,
            description=project_in.description,
            rate=project_in.rate,
            forecasted_billable_hours=project_in.forecasted_billable_hours,
            contingency_percentage=project_in.contingency_percentage,
            forecasted_settlement_amount=project_in.forecasted_settlement_amount,
            forecasted_fee_amount=project_in.forecasted_fee_amount,
            fee_type=project_in.fee_type,
            status=project_in.status,
        )

        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return ProjectRead.model_validate(project)

    def get_project(self, project_id: int) -> Optional[ProjectDetailRead]:
        project = (
            self.db.query(Project)
            .options(joinedload(Project.job), joinedload(Project.project_type))
            .filter(Project.id == project_id)
            .first()
        )
        if not project:
            return None
        return ProjectDetailRead.model_validate(project)

    def get_project_types(self) -> List[ProjectTypeRead]:
        """Get all available project types."""
        types = self.db.query(ProjectType).all()
        return [ProjectTypeRead.model_validate(t) for t in types]
