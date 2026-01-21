from fastapi import APIRouter, HTTPException, status, Query
from sqlmodel import select
from sqlalchemy.orm import joinedload
from app.api.deps import DBDep, CurrentUserDep
from app.models.project_model import (
    Project,
    ProjectCreate,
    ProjectRead,
    ProjectUpdate,
    ProjectType,
    ProjectTypeCreate,
    ProjectTypeRead,
    ProjectTypeUpdate,
    ProjectAddUpdate,
)
from app.models.update_model import create_text_update, create_project_created_update
from app.models.job_model import Job
from app.models.job_read_minimal import JobReadMinimal
from app.models.file_model import File, FileRead


class ProjectReadDetail(ProjectRead):
    project_type: ProjectTypeRead
    job: JobReadMinimal


router = APIRouter()


@router.get(
    "/types", response_model=list[ProjectTypeRead], operation_id="readProjectTypes"
)
def read_project_types(
    db: DBDep,
    current_user: CurrentUserDep,
) -> list[ProjectTypeRead]:
    project_types = db.exec(
        select(ProjectType).where(ProjectType.org_id == current_user.org_id)
    ).all()
    return project_types  # pyright: ignore[reportReturnType]


@router.post(
    "/types",
    status_code=status.HTTP_201_CREATED,
    response_model=ProjectTypeRead,
    operation_id="createProjectType",
)
def create_project_type(
    project_type_in: ProjectTypeCreate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> ProjectTypeRead:
    project_type = ProjectType.model_validate(
        project_type_in, update={"org_id": current_user.org_id}
    )
    db.add(project_type)
    db.commit()
    db.refresh(project_type)
    return project_type  # pyright: ignore[reportReturnType]


@router.patch(
    "/types/{type_id}",
    response_model=ProjectTypeRead,
    operation_id="updateProjectType",
)
def update_project_type(
    type_id: int,
    project_type_in: ProjectTypeUpdate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> ProjectTypeRead:
    project_type = db.exec(
        select(ProjectType).where(
            ProjectType.id == type_id,
            ProjectType.org_id == current_user.org_id,
        )
    ).first()
    if not project_type:
        raise HTTPException(status_code=404, detail="Project type not found")
    update_data = project_type_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project_type, key, value)
    db.add(project_type)
    db.commit()
    db.refresh(project_type)
    return project_type  # pyright: ignore[reportReturnType]


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=ProjectRead,
    operation_id="createProject",
)
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

    # Add auto-update to the parent job
    job = db.get(Job, project.job_id)
    if job:
        initials = (
            "".join(word[0].upper() for word in (current_user.name or "").split()[:2])
            or "??"
        )
        update_item = create_project_created_update(
            project_name=project.name,
            project_id=project.id,  # pyright: ignore[reportArgumentType]
            author_id=current_user.id,  # pyright: ignore[reportArgumentType]
            author_name=current_user.name,
            author_initials=initials,
        )
        if job.updates is None:
            job.updates = []
        job.updates = [update_item.model_dump(mode="json")] + job.updates
        db.add(job)
        db.commit()

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


@router.get(
    "/{project_id}", response_model=ProjectReadDetail, operation_id="readProject"
)
def read_project(
    project_id: int,
    db: DBDep,
    current_user: CurrentUserDep,
) -> ProjectReadDetail:
    project = (
        db.exec(
            select(Project)
            .where(Project.id == project_id)
            .options(
                joinedload(Project.project_type),  # pyright: ignore[reportArgumentType]
                joinedload(Project.job),
            )
        )
        .unique()
        .first()
    )

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Verify ownership via Org
    if project.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return project  # pyright: ignore[reportReturnType]
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


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    operation_id="deleteProject",
)
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


# -----------------------------------------------------------------------------
# PROJECT UPDATES ENDPOINTS
# -----------------------------------------------------------------------------


@router.post(
    "/{project_id}/updates",
    response_model=ProjectRead,
    operation_id="addProjectUpdate",
)
def add_project_update(
    project_id: int,
    update_in: ProjectAddUpdate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> ProjectRead:
    """Add a new update to the project's update feed."""
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Create the update item with user info
    initials = (
        "".join(word[0].upper() for word in (current_user.name or "").split()[:2])
        or "??"
    )

    # Use unified UpdateItem
    update_item = create_text_update(
        text=update_in.text,
        author_id=current_user.id,  # pyright: ignore[reportArgumentType]
        author_name=current_user.name,
        author_initials=initials,
        time_entry_id=update_in.time_entry_id,
    )

    # Append to existing updates or create new list
    current_updates = project.updates or []
    current_updates.append(update_item.model_dump(mode="json"))
    project.updates = current_updates

    db.add(project)
    db.commit()
    db.refresh(project)
    return project  # pyright: ignore[reportReturnType]


@router.delete(
    "/{project_id}/updates/{update_id}",
    response_model=ProjectRead,
    operation_id="deleteProjectUpdate",
)
def delete_project_update(
    project_id: int,
    update_id: str,
    current_user: CurrentUserDep,
    db: DBDep,
) -> ProjectRead:
    """Remove an update from the project's update feed by its UUID."""
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    current_updates = project.updates or []
    # Filter out the update with matching id
    new_updates = [u for u in current_updates if u.get("id") != update_id]

    if len(new_updates) == len(current_updates):
        raise HTTPException(status_code=404, detail="Update not found")

    project.updates = new_updates if new_updates else None

    db.add(project)
    db.commit()
    db.refresh(project)
    return project  # pyright: ignore[reportReturnType]


# -----------------------------------------------------------------------------
# PROJECT FILES ENDPOINTS
# -----------------------------------------------------------------------------


@router.get(
    "/{project_id}/files",
    response_model=list[FileRead],
    operation_id="readProjectFiles",
)
def read_project_files(
    project_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
) -> list[FileRead]:
    """Get all files attached to a project."""
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    files = db.exec(select(File).where(File.project_id == project_id)).all()
    return files  # pyright: ignore[reportReturnType]
