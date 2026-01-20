from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from sqlmodel import select
from app.api.deps import DBDep, CurrentUserDep
from app.models.time_entry_model import (
    TimeEntry,
    TimeEntryCreate,
    TimeEntryManualCreate,
    TimeEntryOut,
    TimeEntryRead,
)
from app.models.project_model import Project

router = APIRouter()


@router.post("/start", response_model=TimeEntryOut, operation_id="startTimer")
def start_timer(
    entry_in: TimeEntryCreate,
    current_user: CurrentUserDep,
    db: DBDep,
):
    """Start a new timer for a project. Stops any existing active timer."""
    # 1. Check if ANY timer is active for this user
    active_entry = db.exec(
        select(TimeEntry)
        .where(TimeEntry.user_id == current_user.id)
        .where(TimeEntry.end_time is None)
    ).first()

    if active_entry:
        raise HTTPException(
            status_code=400, detail="Timer already running. Stop it first."
        )

    # 2. Check project existence and authorization
    project = db.get(Project, entry_in.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # 3. Create entry
    entry = TimeEntry(
        project_id=entry_in.project_id,
        user_id=current_user.id,
        start_time=datetime.now(timezone.utc),
        description=entry_in.description,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    return TimeEntryOut(
        **entry.model_dump(),
        project_name=project.name,
        user_name=current_user.name,
    )


@router.post("/stop", response_model=TimeEntryOut, operation_id="stopTimer")
def stop_timer(
    current_user: CurrentUserDep,
    db: DBDep,
    description: str | None = None,
):
    """Stop the currently active timer and update project actual hours."""
    active_entry = db.exec(
        select(TimeEntry)
        .where(TimeEntry.user_id == current_user.id)
        .where(TimeEntry.end_time is None)
    ).first()

    if not active_entry:
        raise HTTPException(status_code=404, detail="No active timer found")

    # Update end time
    now = datetime.now(timezone.utc)
    active_entry.end_time = now

    # Calculate duration and store it
    duration = now - active_entry.start_time.replace(tzinfo=timezone.utc)
    minutes = max(1, int(duration.total_seconds() / 60))  # Minimum 1 minute
    active_entry.duration_minutes = minutes
    hours_to_add = minutes / 60.0

    # Update description if provided
    if description:
        active_entry.description = description

    # Update Project actual_hours
    project = db.get(Project, active_entry.project_id)
    if project:
        project.actual_hours = (project.actual_hours or 0) + hours_to_add
        db.add(project)

    db.add(active_entry)
    db.commit()
    db.refresh(active_entry)

    return TimeEntryOut(
        **active_entry.model_dump(),
        project_name=project.name if project else "Unknown",
        user_name=current_user.name,
    )


@router.post("/manual", response_model=TimeEntryOut, operation_id="logTimeManually")
def log_time_manually(
    entry_in: TimeEntryManualCreate,
    current_user: CurrentUserDep,
    db: DBDep,
):
    """Log time manually without using the timer."""
    # Check project existence and authorization
    project = db.get(Project, entry_in.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Create entry with start and end time based on duration
    now = datetime.now(timezone.utc)
    entry = TimeEntry(
        project_id=entry_in.project_id,
        user_id=current_user.id,
        start_time=now,
        end_time=now,  # Same as start for manual entries
        description=entry_in.description,
        duration_minutes=entry_in.duration_minutes,
    )
    db.add(entry)

    # Update Project actual_hours
    hours_to_add = entry_in.duration_minutes / 60.0
    project.actual_hours = (project.actual_hours or 0) + hours_to_add
    db.add(project)

    db.commit()
    db.refresh(entry)

    return TimeEntryOut(
        **entry.model_dump(),
        project_name=project.name,
        user_name=current_user.name,
    )


@router.get(
    "/current", response_model=TimeEntryOut | None, operation_id="getCurrentTimer"
)
def get_current_timer(
    current_user: CurrentUserDep,
    db: DBDep,
):
    """Get the currently active timer if exists."""
    active_entry = db.exec(
        select(TimeEntry)
        .where(TimeEntry.user_id == current_user.id)
        .where(TimeEntry.end_time is None)
    ).first()

    if not active_entry:
        return None

    project = db.get(Project, active_entry.project_id)

    # Calc current duration on the fly for display
    now = datetime.now(timezone.utc)
    duration = now - active_entry.start_time.replace(tzinfo=timezone.utc)
    minutes = int(duration.total_seconds() / 60)

    return TimeEntryOut(
        **active_entry.model_dump(),
        project_name=project.name if project else "Unknown",
        user_name=current_user.name,
        duration_minutes=minutes,
    )


@router.get(
    "/project/{project_id}",
    response_model=list[TimeEntryRead],
    operation_id="getProjectTimeEntries",
)
def get_project_time_entries(
    project_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
):
    """Get all time entries for a specific project."""
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    entries = db.exec(
        select(TimeEntry)
        .where(TimeEntry.project_id == project_id)
        .order_by(TimeEntry.start_time.desc())  # pyright: ignore[reportAttributeAccessIssue]
    ).all()

    return entries  # pyright: ignore[reportReturnType]
