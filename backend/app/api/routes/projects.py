from fastapi import APIRouter, HTTPException, status, Query
from sqlmodel import select
from app.api.deps import DBDep, CurrentUserDep
from app.models.project_model import (
    Project,
    ProjectCreate,
    ProjectRead,
    ProjectUpdate,
    ProjectType,
    ProjectTypeRead,
)

router = APIRouter()


@router.get("/types", response_model=list[ProjectTypeRead], operation_id="readProjectTypes")
def read_project_types(
    db: DBDep,
    current_user: CurrentUserDep,
) -> list[ProjectTypeRead]:
    project_types = db.exec(
        select(ProjectType).where(ProjectType.org_id == current_user.org_id)
    ).all()
    return project_types  # pyright: ignore[reportReturnType]


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=ProjectRead, operation_id="createProject")
def create_project(
    project_in: ProjectCreate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> ProjectRead:
    extra_data = {"org_id": current_user.org_id, "created_by_user_id": current_user.id}
    project = Project.model_validate(project_in, update=extra_data)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project  # pyright: ignore[reportReturnType]


@router.get("/", response_model=list[ProjectRead], operation_id="readProjects")
def read_projects(
    current_user: CurrentUserDep,
    db: DBDep,
    offset: int = 0,
    limit: int = Query(default=100, le=100),
    job_id: int | None = None,
) -> list[ProjectRead]:
    if job_id:
        projects = db.exec(
            select(Project)
            .where(current_user.org_id == Project.org_id, Project.job_id == job_id)
            .offset(offset)
            .limit(limit)
        ).all()
    else:
        projects = db.exec(
            select(Project)
            .where(current_user.org_id == Project.org_id)
            .offset(offset)
            .limit(limit)
        ).all()
    return projects  # pyright: ignore[reportReturnType]


@router.get("/{project_id}", response_model=ProjectRead, operation_id="readProject")
def read_project(
    project_id: int,
    db: DBDep,
) -> ProjectRead:
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project  # pyright: ignore[reportReturnType]


@router.patch("/{project_id}", response_model=ProjectRead, operation_id="updateProject")
def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> ProjectRead:
    db_project = db.get(Project, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    if db_project.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    project_data = project_in.model_dump(exclude_unset=True)
    db_project.sqlmodel_update(project_data)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project  # pyright: ignore[reportReturnType]


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT, operation_id="deleteProject")
def delete_project(
    project_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
):
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if current_user.org_id and project.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(project)
    db.commit()
    return
