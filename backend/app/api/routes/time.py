from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from sqlmodel import select
from app.api.deps import DBDep, CurrentUserDep
from app.models.time_entry_model import TimeEntry, TimeEntryCreate, TimeEntryOut
from app.models.project_model import Project

router = APIRouter()


@router.post("/start", response_model=TimeEntryOut)
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

    # 2. Check project existence
    project = db.get(Project, entry_in.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

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
        **entry.model_dump(), project_name=project.name, duration_minutes=0
    )


@router.post("/stop", response_model=TimeEntryOut)
def stop_timer(
    current_user: CurrentUserDep,
    db: DBDep,
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

    # Calculate duration
    duration = now - active_entry.start_time.replace(tzinfo=timezone.utc)
    minutes = max(1, int(duration.total_seconds() / 60))  # Minimum 1 minute
    hours_to_add = minutes / 60.0

    # Update Project
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
        duration_minutes=minutes,
    )


@router.get("/current", response_model=TimeEntryOut | None)
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
        duration_minutes=minutes,
    )
