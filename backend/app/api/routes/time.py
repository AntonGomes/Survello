from typing import cast
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from sqlmodel import select, desc
from app.api.deps import DBDep, CurrentUserDep
from app.models.time_entry_model import (
    TimeEntry,
    TimeEntryCreate,
    TimeEntryManualCreate,
    TimeEntryOut,
    TimeEntryRead,
)
from app.models.instruction_model import Instruction, InstructionType

router = APIRouter()


def get_instruction_display_name(instruction: Instruction, db: DBDep) -> str:
    """Get display name from instruction type."""
    if instruction.instruction_type_id:
        instruction_type = db.get(InstructionType, instruction.instruction_type_id)
        if instruction_type:
            return instruction_type.name
    return "Unknown"


@router.post("/start", response_model=TimeEntryOut, operation_id="startTimer")
def start_timer(
    entry_in: TimeEntryCreate,
    current_user: CurrentUserDep,
    db: DBDep,
):
    """Start a new timer for an instruction. Stops any existing active timer."""
    # 1. Check if ANY timer is active for this user
    active_entry = db.exec(
        select(TimeEntry)
        .where(TimeEntry.user_id == current_user.id)
        .where(TimeEntry.end_time == None)  # noqa: E711
    ).first()

    if active_entry:
        raise HTTPException(
            status_code=400, detail="Timer already running. Stop it first."
        )

    # 2. Check instruction existence and authorization
    instruction = db.get(Instruction, entry_in.instruction_id)
    if not instruction:
        raise HTTPException(status_code=404, detail="Instruction not found")
    if instruction.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # 3. Create entry
    entry = TimeEntry(
        instruction_id=entry_in.instruction_id,
        user_id=current_user.id,
        start_time=datetime.now(timezone.utc),
        description=entry_in.description,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    return TimeEntryOut(
        **entry.model_dump(),
        instruction_name=get_instruction_display_name(instruction, db),
        user_name=current_user.name,
    )


@router.post("/stop", response_model=TimeEntryOut, operation_id="stopTimer")
def stop_timer(
    current_user: CurrentUserDep,
    db: DBDep,
    description: str | None = None,
):
    """Stop the currently active timer."""
    active_entry = db.exec(
        select(TimeEntry)
        .where(TimeEntry.user_id == current_user.id)
        .where(TimeEntry.end_time == None)  # noqa: E711
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

    # Update description if provided
    if description:
        active_entry.description = description

    # Get instruction for display name
    instruction = db.get(Instruction, active_entry.instruction_id)

    db.add(active_entry)
    db.commit()
    db.refresh(active_entry)

    instruction_name = "Unknown"
    if instruction:
        instruction_name = get_instruction_display_name(instruction, db)

    return TimeEntryOut(
        **active_entry.model_dump(),
        instruction_name=instruction_name,
        user_name=current_user.name,
    )


@router.post("/manual", response_model=TimeEntryOut, operation_id="logTimeManually")
def log_time_manually(
    entry_in: TimeEntryManualCreate,
    current_user: CurrentUserDep,
    db: DBDep,
):
    """Log time manually without using the timer."""
    # Check instruction existence and authorization
    instruction = db.get(Instruction, entry_in.instruction_id)
    if not instruction:
        raise HTTPException(status_code=404, detail="Instruction not found")
    if instruction.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Create entry with start and end time based on duration
    now = datetime.now(timezone.utc)
    entry = TimeEntry(
        instruction_id=entry_in.instruction_id,
        user_id=current_user.id,
        start_time=now,
        end_time=now,  # Same as start for manual entries
        description=entry_in.description,
        duration_minutes=entry_in.duration_minutes,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    return TimeEntryOut(
        **entry.model_dump(),
        instruction_name=get_instruction_display_name(instruction, db),
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
        .where(TimeEntry.end_time == None)  # noqa: E711
    ).first()

    if not active_entry:
        return None

    instruction = db.get(Instruction, active_entry.instruction_id)

    # Calc current duration on the fly for display
    now = datetime.now(timezone.utc)
    duration = now - active_entry.start_time.replace(tzinfo=timezone.utc)
    minutes = int(duration.total_seconds() / 60)

    instruction_name = "Unknown"
    if instruction:
        instruction_name = get_instruction_display_name(instruction, db)

    return TimeEntryOut(
        **active_entry.model_dump(exclude={"duration_minutes"}),
        instruction_name=instruction_name,
        user_name=current_user.name,
        duration_minutes=minutes,
    )


@router.get(
    "/instruction/{instruction_id}",
    response_model=list[TimeEntryRead],
    operation_id="getInstructionTimeEntries",
)
def get_instruction_time_entries(
    instruction_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
):
    """Get all time entries for a specific instruction."""
    instruction = db.get(Instruction, instruction_id)
    if not instruction:
        raise HTTPException(status_code=404, detail="Instruction not found")
    if instruction.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    entries = db.exec(
        select(TimeEntry)
        .where(TimeEntry.instruction_id == instruction_id)
        .order_by(desc(TimeEntry.start_time))
    ).all()

    return cast(list[TimeEntryRead], entries)
