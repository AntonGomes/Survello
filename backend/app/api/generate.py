from __future__ import annotations

from pathlib import Path
import uuid

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.deps import get_openai_client, get_db
from app.core.settings import Settings, get_settings
from app.models.orm import Document, Job, JobStatus, User
from app.models.request_models import (
    CreateJobRequest,
    CreateJobResponse,
    DownloadGenDocUrlResponse,
    PresignUploadsRequest,
    PresignUploadsResponse,
    PresignedUpload,
)
from app.services.processing import ProcessingOrchestrator
from app.services.storage import get_storage_backend

router = APIRouter()

@router.post("/generate/presign_uploads", response_model=PresignUploadsResponse)
def presign_uploads(
    request: PresignUploadsRequest,
    settings: Settings = Depends(get_settings),
):
    """Return presigned upload URLs for provided files."""
    storage = get_storage_backend(settings)

    uploads: list[PresignedUpload] = []
    for file in request.files:
        storage_key = f"uploads/{request.user_id}/{uuid.uuid4()}-{file.name}"
        upload_url = storage.get_presigned_upload_url(
            storage_key,
            file.content_type,
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

@router.post("/generate/create_job")
def create_job(
    request: CreateJobRequest,
    db: Session = Depends(get_db),
) -> CreateJobResponse:
    user = db.query(User).filter(User.id == uuid.UUID(request.user_id)).first()

    template_name = Path(request.template_file_url).name 

    template_doc = Document(
        id=uuid.uuid4(),
        owner_user_id=user.id,
        name=template_name,
        file_url=request.template_file_url,
        mime_type="application/octet-stream",
    )
    db.add(template_doc)
    db.flush()

    job = Job(
        id=uuid.uuid4(),
        user_id=user.id,
        template_id=template_doc.id,
        status=JobStatus.pending,
        context_s3_urls=request.context_file_urls,
    )
    db.add(job)
    db.commit()
    return CreateJobResponse(id=str(job.id))


@router.get("/generate/download_url/{job_id}")
def get_download_url(
    job_id: str,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    """Return a presigned download URL for the generated document of a job."""
    try:
        parsed_job_id = uuid.UUID(job_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid job id") from exc

    job = db.query(Job).filter(Job.id == parsed_job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if not getattr(job, "output_document_url", None):
        raise HTTPException(status_code=404, detail="Output document not found")

    storage = get_storage_backend(settings)
    download_url = storage.get_presigned_download_url(job.output_document_url)

    return DownloadGenDocUrlResponse(download_url=download_url)

@router.get("/generate/run_job/{job_id}")
def generate_document(
    job_id: str,
    settings: Settings = Depends(get_settings),
    client=Depends(get_openai_client),
    db: Session = Depends(get_db),
):
    orchestrator = ProcessingOrchestrator(
        job_id=job_id,
        client=client,
        settings=settings,
        db=db,
    )

    return StreamingResponse(
        orchestrator.run(),
        media_type="text/event-stream",
    )
