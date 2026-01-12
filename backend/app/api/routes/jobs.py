from fastapi import APIRouter, HTTPException, status
from sqlmodel import select
from app.api.deps import DBDep, CurrentUserDep
from app.models.job_model import Job, JobCreate, JobRead, JobUpdate

router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=JobRead, operation_id="createJob")
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
    skip: int = 0,
    limit: int = 100,
) -> list[JobRead]:
    jobs = db.exec(
        select(Job).where(Job.org_id == current_user.org_id).offset(skip).limit(limit)
    ).all()
    return jobs  # pyright: ignore[reportReturnType]


@router.get("/{job_id}", response_model=JobRead, operation_id="readJob")
def read_job(
    job_id: int,
    db: DBDep,
    current_user: CurrentUserDep,
) -> JobRead:
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")
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


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT, operation_id="deleteJob")
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
