from datetime import datetime, timezone
from typing import Any
from fastapi import APIRouter, HTTPException, status
from sqlmodel import select
from sqlalchemy.orm import joinedload
from pydantic import BaseModel
from app.api.deps import DBDep, CurrentUserDep
from app.models.job_model import Job, JobCreate, JobRead, JobUpdate, JobReadDetail

router = APIRouter()


class JobUpdateEntry(BaseModel):
    text: str


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=JobRead,
    operation_id="createJob",
)
def create_job(
    job_in: JobCreate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> JobRead:
    extra_data = {"org_id": current_user.org_id, "created_by_user_id": current_user.id}
    job = Job.model_validate(job_in, update=extra_data)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job  # pyright: ignore[reportReturnType]


@router.get("/", response_model=list[JobRead], operation_id="readJobs")
def read_jobs(
    current_user: CurrentUserDep,
    db: DBDep,
    offset: int = 0,
    limit: int = 100,
) -> list[JobRead]:
    query = (
        select(Job)
        .where(Job.org_id == current_user.org_id)  # Security Scope
        .options(
            joinedload(Job.client),
            joinedload(Job.created_by_user),
            joinedload(Job.lead_user),
        )
        .offset(offset)
        .limit(limit)
    )

    jobs = db.exec(query).unique().all()
    return jobs


@router.get("/{job_id}", response_model=JobReadDetail, operation_id="readJob")
def read_job(
    job_id: int,
    db: DBDep,
    current_user: CurrentUserDep,
) -> JobReadDetail:
    query = (
        select(Job)
        .where(Job.id == job_id)
        .where(Job.org_id == current_user.org_id)
        .options(
            joinedload(Job.client),
            joinedload(Job.created_by_user),
            joinedload(Job.lead_user),
            joinedload(Job.projects),
            joinedload(Job.files),
        )
    )

    job = db.exec(query).unique().first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job  # pyright: ignore[reportReturnType]


@router.patch("/{job_id}", response_model=JobRead, operation_id="updateJob")
def update_job(
    job_id: int,
    job_in: JobUpdate,
    db: DBDep,
    current_user: CurrentUserDep,
) -> JobRead:
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if current_user.org_id and job.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    job_data = job_in.model_dump(exclude_unset=True)
    job.sqlmodel_update(job_data)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job  # pyright: ignore[reportReturnType]


@router.delete(
    "/{job_id}", status_code=status.HTTP_204_NO_CONTENT, operation_id="deleteJob"
)
def delete_job(
    job_id: int,
    db: DBDep,
    current_user: CurrentUserDep,
):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if current_user.org_id and job.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(job)
    db.commit()
    return


@router.post(
    "/{job_id}/updates",
    response_model=JobRead,
    operation_id="addJobUpdate",
)
def add_job_update(
    job_id: int,
    update_entry: JobUpdateEntry,
    current_user: CurrentUserDep,
    db: DBDep,
) -> JobRead:
    """Add an update entry to a job's timeline."""
    job = (
        db.exec(
            select(Job)
            .where(Job.id == job_id)
            .options(
                joinedload(Job.client),
                joinedload(Job.created_by_user),
                joinedload(Job.lead_user),
            )
        )
        .unique()
        .first()
    )

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    new_update: dict[str, Any] = {
        "text": update_entry.text,
        "user_id": current_user.id,
        "user_name": current_user.name,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    if job.updates is None:
        job.updates = []
    job.updates = [new_update] + job.updates  # Prepend new update

    db.add(job)
    db.commit()
    db.refresh(job)
    return job  # pyright: ignore[reportReturnType]
