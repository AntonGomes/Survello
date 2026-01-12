from __future__ import annotations

from fastapi import APIRouter, HTTPException, BackgroundTasks
from sqlmodel import select

from app.api.deps import StorageDep, CurrentUserDep, DBDep, LLMDep
from app.orchestrators.generation import execute
from app.models.run_model import (
    Run,
    RunCreate,
    RunRead,
)
from app.models.artefact_model import Artefact


router = APIRouter()


@router.post("/", response_model=RunRead, operation_id="createRun")
def create_run(
    run_in: RunCreate,
    background_tasks: BackgroundTasks,
    current_user: CurrentUserDep,
    db: DBDep,
    storage: StorageDep,
    llm: LLMDep,
) -> Run:
    """
    Create a new document generation run and start the orchestrator in the background.
    """
    # Create the Run record
    extra_data = {"org_id": current_user.org_id, "created_by_user_id": current_user.id}
    db_run = Run.model_validate(run_in, update=extra_data)
    db.add(db_run)
    db.commit()
    db.refresh(db_run)

    # Start the orchestrator in the background
    if db_run.id:
        background_tasks.add_task(execute, db_run, db, storage, llm)

    return db_run


@router.get("/{run_id}", response_model=RunRead, operation_id="readRun")
def read_run(
    run_id: int,
    db: DBDep,
    current_user: CurrentUserDep,
) -> Run:
    """
    Retrieve a document generation run by its ID.
    """
    run = db.get(Run, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    if run.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return run


@router.get(
    "/{run_id}/artefacts",
    response_model=list[Artefact],
    operation_id="readRunArtefacts",
)
def read_run_artefacts(
    run_id: int,
    db: DBDep,
    current_user: CurrentUserDep,
) -> list[Artefact]:
    """
    Retrieve artefacts for a run.
    """
    run = db.get(Run, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    if run.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return run.artefacts


@router.get("/", response_model=RunRead, operation_id="readRuns")
def read_runs(
    db: DBDep,
    current_user: CurrentUserDep,
    offset: int = 0,
    limit: int = 100,
) -> list[Run]:
    """
    Retrieve document generation runs for the current user's organization.
    """
    runs = db.exec(
        select(Run).where(Run.org_id == current_user.org_id).offset(offset).limit(limit)
    ).all()
    return list(runs)
