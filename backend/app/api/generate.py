from __future__ import annotations

from fastapi import APIRouter, HTTPException, BackgroundTasks

from app.api.deps import RunRepoDep, StorageDep, CurrentUserDep
from app.services.run_repository import RunRepository
from app.services.file_repository import FileRepository
from app.services.artefact_repository import ArtefactRepository
from app.core.deps import get_database, get_s3, get_openai_client, get_settings
from app.services.storage import StorageService
from app.services.openai_service import OpenAIService
from app.models.request_models import (
    StartRunRequest,
    StartRunResponse,
    LatestArtefactResponse,
    RunStatusResponse,
)
from app.services.docgen_orchestrator import DocGenOrchestrator
from app.core.logging import logger
from app.models.orm import User, Run


# -------------------------------------------------------
# Helpers for Background Tasks
# -------------------------------------------------------


def create_orchestrator_services():
    """Create fresh services for background processing."""
    db = get_database().get_session()
    return (
        db,
        RunRepository(db),
        FileRepository(db),
        ArtefactRepository(db),
        StorageService(get_s3()),
        OpenAIService(get_openai_client(), get_settings().openai_api_key),
    )


def run_orchestrator_background(run: Run):
    db, run_repo, file_repo, artefact_repo, storage, openai_service = create_orchestrator_services()
    try:
        orchestrator = DocGenOrchestrator(run, run_repo, file_repo, artefact_repo, storage, openai_service)
        orchestrator.run_process()
    except Exception:
        logger.exception(f"Background task failed for run {run.id}")
    finally:
        db.close()


# -------------------------------------------------------
# API Endpoints
# -------------------------------------------------------

router = APIRouter()


@router.post("/generate/start_run", response_model=StartRunResponse)
def start_run(
    request: StartRunRequest,
    run_repo: RunRepoDep,
    background_tasks: BackgroundTasks,
    user_id: CurrentUserDep,
):
    """Creates a Run and starts processing in background."""
    user_id_int = int(user_id)
    # org_id = (
    #     run_repo.db.query(User.org_id).filter(User.id == user_id_int).scalar()
    # )

    run = run_repo.create_run(
    # org_id=1,
        created_by_user_id=user_id_int,
        template=request.template,
        context_files=request.context_files,
        job_id=request.job_id,
    )

    background_tasks.add_task(run_orchestrator_background, run)

    return StartRunResponse(run_id=run.id)


@router.get("/generate/status/{run_id}", response_model=RunStatusResponse)
def get_run_status(
    run_id: int,
    repo: RunRepoDep,
    user_id: CurrentUserDep,
):
    """Returns the current status, progress, and model responses of a run."""
    run = repo.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    return RunStatusResponse(
        run_id=run.id,
        status=run.status.value,
        upload_progress=run.upload_progress or 0,  
        model_responses=run.model_responses
    )


@router.get("/generate/latest_artefact/{run_id}", response_model=LatestArtefactResponse)
def get_download_url(
    run_id: int,
    repo: RunRepoDep,
    storage: StorageDep,
    user_id: CurrentUserDep,
):
    """Return a presigned download URL for the generated document."""
    run = repo.get_run(run_id)

    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    artefact = repo.artefact_repo.get_latest_artefact_by_run(run_id)
    if not artefact:
        raise HTTPException(status_code=404, detail="Artefact not found")

    download_url = storage.generate_presigned_url(
        operation="get_object",
        key=artefact.file.storage_key,
    )

    preview_file = artefact.preview_file

    if not preview_file:
        raise HTTPException(status_code=404, detail="Preview document not found")

    preview_url = storage.generate_presigned_url(
        operation="get_object",
        key=preview_file.storage_key,
        content_type="application/pdf",
        inline=True,
        filename=preview_file.file_name,
    )

    return LatestArtefactResponse(download_url=download_url, preview_url=preview_url)
