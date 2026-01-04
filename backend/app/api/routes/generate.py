from __future__ import annotations

from fastapi import APIRouter, HTTPException, BackgroundTasks

from app.api.deps import RunRepoDep, CurrentUserDep, ArtefactRepoDep, StorageDep
from app.core.deps import get_db, get_s3, get_openai_client, get_settings
from app.services.storage import StorageService
from app.services.openai_service import OpenAIService
from app.services.docgen_service import DocGenService
from app.schemas.run_schemas import (
    StartRunRequest,
    StartRunResponse,
    LatestArtefactResponse,
    RunStatusResponse,
)
from app.core.logging import logger


# -------------------------------------------------------
# Helpers for Background Tasks
# -------------------------------------------------------


def run_orchestrator_background(run_id: int):
    """
    Background task wrapper.
    Instantiates the service layer with a fresh DB session and executes the run.
    """
    # Create a new DB session for the background task
    db_gen = get_db()
    db = next(db_gen)

    try:
        # Initialize services
        storage_service = StorageService(get_s3())
        openai_service = OpenAIService(
            get_openai_client(), get_settings().openai_api_key
        )

        # Initialize Domain Service
        docgen_service = DocGenService(db, storage_service, openai_service)

        # Execute
        docgen_service.execute_run(run_id)

    except Exception:
        logger.exception(f"Background task failed for run_id={run_id}")
    finally:
        db.close()


# -------------------------------------------------------
# API Endpoints
# -------------------------------------------------------

router = APIRouter()


@router.post("/start_run", response_model=StartRunResponse, operation_id="startRun")
def start_run(
    request: StartRunRequest,
    run_repo: RunRepoDep,
    background_tasks: BackgroundTasks,
    user: CurrentUserDep,
):
    """Creates a Run and starts processing in background."""
    user_id_int = int(user.id)

    run = run_repo.create_run(
        created_by_user_id=user_id_int,
        template_id=request.template_id,
        context_file_ids=request.context_file_ids,
        job_id=request.job_id,
    )

    # Pass only the ID to the background task
    background_tasks.add_task(run_orchestrator_background, run.id)

    return StartRunResponse(run_id=run.id)


@router.get(
    "/status/{run_id}", response_model=RunStatusResponse, operation_id="getRunStatus"
)
def get_run_status(
    run_id: int,
    repo: RunRepoDep,
    user_id: CurrentUserDep,
):
    """Returns the current status, progress, and model responses of a run."""
    run = repo.get_by_id(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    logger.debug(
        f"Fetched run status for run.id={run.id}: status={run.status}, upload_progress={run.upload_progress}"
    )

    return RunStatusResponse(
        run_id=run.id,
        status=run.status.value,
        upload_progress=run.upload_progress or 0,
        model_responses=run.model_responses,
    )


@router.get(
    "/latest_artefact/{run_id}",
    response_model=LatestArtefactResponse,
    operation_id="getLatestArtefact",
)
def get_download_url(
    run_id: int,
    repo: RunRepoDep,
    artefact_repo: ArtefactRepoDep,
    storage: StorageDep,
    user_id: CurrentUserDep,
):
    """Return a presigned download URL for the generated document."""
    run = repo.get_by_id(run_id)

    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    artefact = artefact_repo.get_latest_by_run(run_id)
    if not artefact:
        raise HTTPException(status_code=404, detail="Artefact not found")

    download_url = storage.generate_presigned_url(
        operation="get_object", file=artefact.file
    )

    preview_url = storage.generate_presigned_url(
        operation="get_object", file=artefact.preview_file
    )

    return LatestArtefactResponse(download_url=download_url, preview_url=preview_url)
