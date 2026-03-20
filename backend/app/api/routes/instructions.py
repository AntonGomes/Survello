from typing import cast

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy.orm import joinedload
from sqlmodel import func, select

from app.api.deps import CurrentUserDep, DBDep
from app.models.file_model import File, FileRead
from app.models.instruction_model import (
    Instruction,
    InstructionAddUpdate,
    InstructionCreate,
    InstructionRead,
    InstructionType,
    InstructionTypeCreate,
    InstructionTypeRead,
    InstructionTypeUpdate,
    InstructionUpdate,
)
from app.models.job_model import Job
from app.models.job_read_minimal import JobReadMinimal
from app.models.update_model import (
    create_instruction_created_update,
    create_text_update,
)


def generate_instruction_number(db, org_id: int) -> str:
    """Generate a semantic instruction number (e.g., INS-00042) for an org."""
    count = db.exec(
        select(func.count(Instruction.id)).where(Instruction.org_id == org_id)
    ).one()
    return f"INS-{(count + 1):05d}"


class InstructionReadDetail(InstructionRead):
    instruction_type: InstructionTypeRead
    job: JobReadMinimal


router = APIRouter()


@router.get(
    "/types",
    response_model=list[InstructionTypeRead],
    operation_id="readInstructionTypes",
)
def read_instruction_types(
    db: DBDep,
    current_user: CurrentUserDep,
) -> list[InstructionTypeRead]:
    instruction_types = db.exec(
        select(InstructionType).where(InstructionType.org_id == current_user.org_id)
    ).all()
    return cast(list[InstructionTypeRead], instruction_types)


@router.post(
    "/types",
    status_code=status.HTTP_201_CREATED,
    response_model=InstructionTypeRead,
    operation_id="createInstructionType",
)
def create_instruction_type(
    instruction_type_in: InstructionTypeCreate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> InstructionTypeRead:
    instruction_type = InstructionType.model_validate(
        instruction_type_in, update={"org_id": current_user.org_id}
    )
    db.add(instruction_type)
    db.commit()
    db.refresh(instruction_type)
    return cast(InstructionTypeRead, instruction_type)


@router.patch(
    "/types/{type_id}",
    response_model=InstructionTypeRead,
    operation_id="updateInstructionType",
)
def update_instruction_type(
    type_id: int,
    instruction_type_in: InstructionTypeUpdate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> InstructionTypeRead:
    instruction_type = db.exec(
        select(InstructionType).where(
            InstructionType.id == type_id,
            InstructionType.org_id == current_user.org_id,
        )
    ).first()
    if not instruction_type:
        raise HTTPException(status_code=404, detail="Instruction type not found")
    update_data = instruction_type_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(instruction_type, key, value)
    db.add(instruction_type)
    db.commit()
    db.refresh(instruction_type)
    return cast(InstructionTypeRead, instruction_type)


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=InstructionRead,
    operation_id="createInstruction",
)
def create_instruction(
    instruction_in: InstructionCreate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> InstructionRead:
    # Fetch instruction type to get the name for display
    instruction_type = db.get(InstructionType, instruction_in.instruction_type_id)
    if not instruction_type:
        raise HTTPException(status_code=400, detail="Invalid instruction type")

    # Generate semantic instruction number
    instruction_number = generate_instruction_number(db, current_user.org_id)
    extra_data = {
        "org_id": current_user.org_id,
        "created_by_user_id": current_user.id,
        "instruction_number": instruction_number,
    }
    instruction = Instruction.model_validate(instruction_in, update=extra_data)
    db.add(instruction)
    db.commit()
    db.refresh(instruction)

    # Add auto-update to the parent job
    job = db.get(Job, instruction.job_id)
    if job:
        assert instruction.id is not None
        assert current_user.id is not None
        initials = (
            "".join(word[0].upper() for word in (current_user.name or "").split()[:2])
            or "??"
        )
        # Use instruction type name since instruction no longer has a name field
        update_item = create_instruction_created_update(
            instruction_name=instruction_type.name,
            instruction_id=instruction.id,
            author_id=current_user.id,
            author_name=current_user.name,
            author_initials=initials,
        )
        if job.updates is None:
            job.updates = []
        job.updates = [update_item.model_dump(mode="json"), *job.updates]
        db.add(job)
        db.commit()

    return cast(InstructionRead, instruction)


@router.get("/", response_model=list[InstructionRead], operation_id="readInstructions")
def read_instructions(
    current_user: CurrentUserDep,
    db: DBDep,
    offset: int = 0,
    limit: int = Query(default=100, le=100),
    job_id: int | None = None,
) -> list[InstructionRead]:
    if job_id:
        instructions = db.exec(
            select(Instruction)
            .where(
                current_user.org_id == Instruction.org_id, Instruction.job_id == job_id
            )
            .offset(offset)
            .limit(limit)
        ).all()
    else:
        instructions = db.exec(
            select(Instruction)
            .where(current_user.org_id == Instruction.org_id)
            .offset(offset)
            .limit(limit)
        ).all()
    return cast(list[InstructionRead], instructions)


@router.get(
    "/{instruction_id}",
    response_model=InstructionReadDetail,
    operation_id="readInstruction",
)
def read_instruction(
    instruction_id: int,
    db: DBDep,
    current_user: CurrentUserDep,
) -> InstructionReadDetail:
    instruction = (
        db.exec(
            select(Instruction)
            .where(Instruction.id == instruction_id)
            .options(
                joinedload(Instruction.instruction_type),  # type: ignore[arg-type]
                joinedload(Instruction.job),
            )
        )
        .unique()
        .first()
    )

    if not instruction:
        raise HTTPException(status_code=404, detail="Instruction not found")

    # Verify ownership via Org
    if instruction.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return cast(InstructionReadDetail, instruction)


@router.patch(
    "/{instruction_id}",
    response_model=InstructionRead,
    operation_id="updateInstruction",
)
def update_instruction(
    instruction_id: int,
    instruction_in: InstructionUpdate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> InstructionRead:
    db_instruction = db.get(Instruction, instruction_id)
    if not db_instruction:
        raise HTTPException(status_code=404, detail="Instruction not found")
    if db_instruction.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    instruction_data = instruction_in.model_dump(exclude_unset=True)
    db_instruction.sqlmodel_update(instruction_data)
    db.add(db_instruction)
    db.commit()
    db.refresh(db_instruction)
    return cast(InstructionRead, db_instruction)


@router.delete(
    "/{instruction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    operation_id="deleteInstruction",
)
def delete_instruction(
    instruction_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
):
    instruction = db.get(Instruction, instruction_id)
    if not instruction:
        raise HTTPException(status_code=404, detail="Instruction not found")
    if current_user.org_id and instruction.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(instruction)
    db.commit()


# -----------------------------------------------------------------------------
# INSTRUCTION UPDATES ENDPOINTS
# -----------------------------------------------------------------------------


@router.post(
    "/{instruction_id}/updates",
    response_model=InstructionRead,
    operation_id="addInstructionUpdate",
)
def add_instruction_update(
    instruction_id: int,
    update_in: InstructionAddUpdate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> InstructionRead:
    """Add a new update to the instruction's update feed."""
    instruction = db.get(Instruction, instruction_id)
    if not instruction:
        raise HTTPException(status_code=404, detail="Instruction not found")
    if instruction.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Create the update item with user info
    initials = (
        "".join(word[0].upper() for word in (current_user.name or "").split()[:2])
        or "??"
    )

    assert current_user.id is not None
    # Use unified UpdateItem
    update_item = create_text_update(
        text=update_in.text,
        author_id=current_user.id,
        author_name=current_user.name,
        author_initials=initials,
        time_entry_id=update_in.time_entry_id,
    )

    # Append to existing updates or create new list
    current_updates = instruction.updates or []
    current_updates.append(update_item.model_dump(mode="json"))
    instruction.updates = current_updates

    db.add(instruction)
    db.commit()
    db.refresh(instruction)
    return cast(InstructionRead, instruction)


@router.delete(
    "/{instruction_id}/updates/{update_id}",
    response_model=InstructionRead,
    operation_id="deleteInstructionUpdate",
)
def delete_instruction_update(
    instruction_id: int,
    update_id: str,
    current_user: CurrentUserDep,
    db: DBDep,
) -> InstructionRead:
    """Remove an update from the instruction's update feed by its UUID."""
    instruction = db.get(Instruction, instruction_id)
    if not instruction:
        raise HTTPException(status_code=404, detail="Instruction not found")
    if instruction.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    current_updates = instruction.updates or []
    # Filter out the update with matching id
    new_updates = [u for u in current_updates if u.get("id") != update_id]

    if len(new_updates) == len(current_updates):
        raise HTTPException(status_code=404, detail="Update not found")

    instruction.updates = new_updates if new_updates else None

    db.add(instruction)
    db.commit()
    db.refresh(instruction)
    return cast(InstructionRead, instruction)


# -----------------------------------------------------------------------------
# INSTRUCTION FILES ENDPOINTS
# -----------------------------------------------------------------------------


@router.get(
    "/{instruction_id}/files",
    response_model=list[FileRead],
    operation_id="readInstructionFiles",
)
def read_instruction_files(
    instruction_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
) -> list[FileRead]:
    """Get all files attached to an instruction."""
    instruction = db.get(Instruction, instruction_id)
    if not instruction:
        raise HTTPException(status_code=404, detail="Instruction not found")
    if instruction.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    files = db.exec(select(File).where(File.instruction_id == instruction_id)).all()
    return cast(list[FileRead], files)
