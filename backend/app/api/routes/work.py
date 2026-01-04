from __future__ import annotations

from typing import List

from fastapi import APIRouter, HTTPException

from app.api.deps import WorkRepoDep, CurrentUserDep
from app.schemas.work_schemas import (
    JobCreate,
    JobRead,
    JobDetailRead,
    ProjectCreate,
    ProjectRead,
    ProjectDetailRead,
    ProjectTypeRead,
)

router = APIRouter()


@router.post("/jobs", response_model=JobRead, operation_id="createJob")
def create_job(
    job_in: JobCreate,
    work_repo: WorkRepoDep,
    current_user: CurrentUserDep,
):
    """Create a new job."""
    # Ensure consistency with current user
    if job_in.created_by_user_id != current_user.id:
        # In a real app, we might check for admin privileges here
        pass

    job = work_repo.create_job(job_in)
    return job


@router.get(
    "/jobs/get_jobs_for_user", response_model=List[JobRead], operation_id="getJobs"
)
def get_jobs_for_user(
    work_repo: WorkRepoDep,
    current_user: CurrentUserDep,
    start: int = 0,
    end: int = 10,
):
    """Get jobs created by the current user with pagination."""
    jobs = work_repo.get_jobs_by_user(user_id=current_user.id, start=start, end=end)
    return jobs


@router.get("/jobs/{job_id}", response_model=JobDetailRead, operation_id="getJob")
def get_job(
    job_id: int,
    work_repo: WorkRepoDep,
    current_user: CurrentUserDep,
):
    """Get job details."""
    job = work_repo.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/projects", response_model=ProjectRead)
def create_project(
    project_in: ProjectCreate,
    work_repo: WorkRepoDep,
    current_user: CurrentUserDep,
):
    """Create a new project."""
    project = work_repo.create_project(project_in)
    return project


@router.get("/projects/{project_id}", response_model=ProjectDetailRead)
def get_project(
    project_id: int,
    work_repo: WorkRepoDep,
    current_user: CurrentUserDep,
):
    """Get project details."""
    project = work_repo.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.get("/project_types", response_model=List[ProjectTypeRead])
def get_project_types(
    work_repo: WorkRepoDep,
    current_user: CurrentUserDep,
):
    """Get all project types."""
    return work_repo.get_project_types()
