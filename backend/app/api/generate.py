from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException, BackgroundTasks

from app.api.deps import JobRepoDep, StorageDep, CurrentUserDep
from app.core.deps import get_database, get_s3, get_openai_client, get_settings
from app.services.job_repository import JobRepository
from app.services.storage import StorageService
from app.services.openai_service import OpenAIService
from app.models.request_models import (
    CreateJobRequest,
    CreateJobResponse,
    DownloadGenDocUrlResponse,
    PresignUploadsRequest,
    PresignUploadsResponse,
    PresignedUpload,
    JobStatusResponse,
)
from app.services.processing import ProcessingOrchestrator
from app.core.logging import logger


router = APIRouter()


def run_orchestrator_background(job_id: str):
    """
    Background task wrapper to run the orchestrator with its own DB session.
    """
    db = get_database().get_session()
    try:
        repo = JobRepository(db)
        storage = StorageService(get_s3())
        openai_service = OpenAIService(
            get_openai_client(), get_settings().openai_api_key
        )

        orchestrator = ProcessingOrchestrator(job_id, repo, storage, openai_service)
        orchestrator.run()
    except Exception as e:
        logger.exception(f"Background task failed for job {job_id}")
    finally:
        db.close()


@router.post("/generate/presign_uploads", response_model=PresignUploadsResponse)
def presign_uploads(
    request: PresignUploadsRequest,
    storage: StorageDep,
    user_id: CurrentUserDep,
):
    """Generate presigned upload URLs for the provided file list."""
    uploads: list[PresignedUpload] = []

    for file in request.files:
        # Construct a unique storage key
        storage_key = f"uploads/{user_id}/{uuid.uuid4()}-{file.name}"

        upload_url = storage.generate_presigned_url(
            operation="put_object", key=storage_key, content_type=file.content_type
        )

        uploads.append(
            PresignedUpload(
                name=file.name,
                content_type=file.content_type,
                kind=file.kind,
                key=storage_key,
                upload_url=upload_url,
            )
        )

    return PresignUploadsResponse(uploads=uploads)


@router.post("/generate/create_job", response_model=CreateJobResponse)
def create_job(
    request: CreateJobRequest,
    repo: JobRepoDep,
    background_tasks: BackgroundTasks,
    user_id: CurrentUserDep,
):
    """Creates a Job and starts processing in background."""
    template_name = Path(request.template_file_url).name

    job = repo.create_job(
        user_id=user_id,
        template_name=template_name,
        template_url=request.template_file_url,
        context_urls=request.context_file_urls,
    )

    background_tasks.add_task(run_orchestrator_background, str(job.id))

    return CreateJobResponse(id=str(job.id))


@router.get("/generate/status/{job_id}", response_model=JobStatusResponse)
def get_job_status(
    job_id: str,
    repo: JobRepoDep,
    user_id: CurrentUserDep,
):
    """Returns the current status, progress, and logs of a job."""
    job = repo.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if str(job.user_id) != user_id:
        logger.error(f"Job user mismatch: job.user_id={job.user_id} ({type(job.user_id)}), user_id={user_id} ({type(user_id)})")
        raise HTTPException(status_code=403, detail="Not authorized")

    return JobStatusResponse(
        id=str(job.id),
        status=job.status.value,
        progress=job.progress or 0,
        logs=job.logs or [],
        output_document_url=job.output_document_url,
    )


@router.get("/generate/download_url/{job_id}", response_model=DownloadGenDocUrlResponse)
def get_download_url(
    job_id: str,
    repo: JobRepoDep,
    storage: StorageDep,
    user_id: CurrentUserDep,
):
    """Return a presigned download URL for the generated document."""
    job = repo.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if str(job.user_id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if not job.output_document_url:
        raise HTTPException(status_code=404, detail="Output document not found")

    download_url = storage.generate_presigned_url(
        operation="get_object",
        key=job.output_document_url,
    )

    if not job.preview_pdf_document_url:
        raise HTTPException(status_code=404, detail="Preview document not found")

    preview_url = storage.generate_presigned_url(
        operation="get_object",
        key=job.preview_pdf_document_url,
        content_type="application/pdf",
        inline=True,
        filename=f"preview-{job.id}.pdf"
    )

    return DownloadGenDocUrlResponse(download_url=download_url, preview_url=preview_url)
