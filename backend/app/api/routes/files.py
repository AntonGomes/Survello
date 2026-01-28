from typing import cast
from uuid import uuid4
import logging
from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.api.deps import StorageDep, CurrentUserDep, DBDep
from app.models.file_model import (
    File,
    FileCreate,
    FilePresignRequest,
    FilePresignResponse,
    FileRead,
    FileRole,
    FileUpdate,
)
from app.models.job_model import Job
from app.models.update_model import create_file_upload_update
from app.utils.conversion import to_pdf, ConversionError, DOCX_MIME, XLSX_MIME

logger = logging.getLogger(__name__)

router = APIRouter()


def _add_file_upload_update_to_job(
    db: DBDep,
    job_id: int | None,
    file_count: int,
    user_id: int,
    user_name: str | None,
) -> None:
    """Add an auto-update to the job when files are uploaded."""
    if not job_id:
        return

    job = db.get(Job, job_id)
    if not job:
        return

    initials = (
        "".join(word[0].upper() for word in (user_name or "").split()[:2]) or "??"
    )

    update_item = create_file_upload_update(
        file_count=file_count,
        author_id=user_id,
        author_name=user_name,
        author_initials=initials,
    )

    if job.updates is None:
        job.updates = []
    job.updates = [update_item.model_dump(mode="json")] + job.updates
    db.add(job)
    db.commit()


def _maybe_generate_preview(
    db_file: File,
    storage: StorageDep,
    db: DBDep,
    user_id: int,
    org_id: int,
) -> None:
    """Generate PDF preview for DOCX/XLSX files and link it to the original."""
    if db_file.mime_type not in (DOCX_MIME, XLSX_MIME):
        return

    try:
        # Download the file bytes from S3
        file_bytes = storage.get_file_data(db_file.storage_key)
        if not file_bytes:
            logger.warning(
                f"Could not download file {db_file.id} for preview generation"
            )
            return

        # Convert to PDF
        pdf_bytes = to_pdf(file_bytes)

        # Upload the preview PDF to S3
        preview_key = f"{org_id}/{user_id}/preview-{uuid4()}.pdf"
        storage.upload_file(preview_key, pdf_bytes)

        # Create the preview file record
        preview_file = File(
            file_name=f"{db_file.file_name}.pdf",
            mime_type="application/pdf",
            size_bytes=len(pdf_bytes),
            storage_key=preview_key,
            role=FileRole.PREVIEW_PDF,
            org_id=org_id,
            uploaded_by_user_id=user_id,
            job_id=db_file.job_id,
            instruction_id=db_file.instruction_id,
        )
        db.add(preview_file)
        db.commit()
        db.refresh(preview_file)

        # Link the preview to the original file
        db_file.preview_file_id = preview_file.id
        db.add(db_file)
        db.commit()

        logger.info(f"Generated PDF preview {preview_file.id} for file {db_file.id}")
    except ConversionError as e:
        logger.warning(f"Could not generate preview for file {db_file.id}: {e}")
    except Exception as e:
        logger.error(f"Unexpected error generating preview for file {db_file.id}: {e}")


@router.post(
    "/presign",
    response_model=list[FilePresignResponse],
    status_code=status.HTTP_200_OK,
    operation_id="generateFileUploadUrls",
)
def generate_upload_urls(
    files: list[FilePresignRequest],
    storage: StorageDep,
    user: CurrentUserDep,
) -> list[FilePresignResponse]:
    """
    Generate presigned PUT URLs. Does NOT create DB records yet.
    """
    response: list[FilePresignResponse] = []

    for f in files:
        storage_key = f"{user.org_id}/{user.id}/{uuid4()}-{f.file_name}"

        url = storage.generate_presigned_url(
            "put_object",
            storage_key=storage_key,
            mime_type=f.mime_type,
            file_name=f.file_name,
        )

        extra_data = {"storage_key": storage_key, "put_url": url}
        response.append(FilePresignResponse.model_validate(f, update=extra_data))

    return response


@router.post(
    "/single",
    response_model=FileRead,
    status_code=status.HTTP_201_CREATED,
    operation_id="createFile",
)
def create_file(
    file_in: FileCreate,
    db: DBDep,
    storage: StorageDep,
    user: CurrentUserDep,
) -> FileRead:
    """
    Standard Create Endpoint.
    Client calls this AFTER successfully uploading to the presigned URL.
    Automatically generates PDF preview for DOCX/XLSX files.
    """
    extra_data = {"uploaded_by_user_id": user.id, "org_id": user.org_id}
    if not storage.check_file_exists(file_in.storage_key):
        raise HTTPException(400, "File verification failed. Upload not found.")
    db_file = File.model_validate(file_in, update=extra_data)
    db.add(db_file)

    db.commit()
    db.refresh(db_file)

    assert user.id is not None
    # Generate PDF preview for Office documents
    _maybe_generate_preview(db_file, storage, db, user.id, user.org_id)
    db.refresh(db_file)

    # Add auto-update to job if this file is attached to a job
    _add_file_upload_update_to_job(db, db_file.job_id, 1, user.id, user.name)

    return cast(FileRead, db_file)


@router.post(
    "/",
    response_model=list[FileRead],
    status_code=status.HTTP_201_CREATED,
    operation_id="createFiles",
)
def create_files(
    files_in: list[FileCreate],
    db: DBDep,
    storage: StorageDep,
    user: CurrentUserDep,
) -> list[FileRead]:
    """
    Create Endpoint for multiple files.
    Automatically generates PDF previews for DOCX/XLSX files.
    """
    files: list[File] = []
    extra_data = {"uploaded_by_user_id": user.id, "org_id": user.org_id}
    for file_in_item in files_in:
        if not storage.check_file_exists(file_in_item.storage_key):
            raise HTTPException(400, f"File verification failed. Upload not found. storage_key:{file_in_item.storage_key}")
        db_file = File.model_validate(file_in_item, update=extra_data)
        db.add(db_file)
        files.append(db_file)

    db.commit()
    for f in files:
        db.refresh(f)

    assert user.id is not None
    # Generate PDF previews for Office documents
    for f in files:
        _maybe_generate_preview(f, storage, db, user.id, user.org_id)
        db.refresh(f)

    # Add auto-updates to jobs for uploaded files
    # Group files by job_id and add one update per job
    job_file_counts: dict[int, int] = {}
    for f in files:
        if f.job_id:
            job_file_counts[f.job_id] = job_file_counts.get(f.job_id, 0) + 1

    for job_id, count in job_file_counts.items():
        _add_file_upload_update_to_job(db, job_id, count, user.id, user.name)

    return cast(list[FileRead], files)


@router.get("/{file_id}", response_model=FileRead, operation_id="readFile")
def read_file(
    file_id: int,
    db: DBDep,
    current_user: CurrentUserDep,
) -> FileRead:
    """
    Get file metadata by ID.
    """
    file = db.get(File, file_id)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    if file.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return cast(FileRead, file)


@router.patch("/{file_id}", response_model=FileRead, operation_id="updateFile")
def update_file(
    file_id: int,
    file_in: FileUpdate,
    db: DBDep,
    current_user: CurrentUserDep,
) -> FileRead:
    """
    Update file metadata (e.g., attach to job/project).
    """
    file = db.get(File, file_id)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    if file.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = file_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(file, key, value)
    db.add(file)
    db.commit()
    db.refresh(file)
    return cast(FileRead, file)


@router.get(
    "/{file_id}/download", response_model=str, operation_id="generateFileDownloadUrl"
)
def generate_download_url(
    file_id: int,
    db: DBDep,
    storage: StorageDep,
    current_user: CurrentUserDep,
    inline: bool = False,
) -> str:
    """
    Generate a presigned download URL for a file.

    Args:
        inline: If True, sets content-disposition to inline (for browser preview).
               If False (default), sets to attachment (for download).
    """
    file = db.get(File, file_id)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    if file.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return storage.generate_presigned_url(
        "get_object",
        storage_key=file.storage_key,
        mime_type=file.mime_type,
        file_name=file.file_name,
        inline=inline,
    )


@router.get("/", response_model=list[FileRead], operation_id="readFiles")
def read_files(
    db: DBDep,
    current_user: CurrentUserDep,
    offset: int = 0,
    limit: int = 100,
) -> list[FileRead]:
    """
    Retrieve files.
    """
    files = db.exec(
        select(File)
        .where(File.org_id == current_user.org_id)
        .offset(offset)
        .limit(limit)
    ).all()
    if not files:
        raise HTTPException(status_code=404, detail="No files found")
    if any(file.org_id != current_user.org_id for file in files):
        raise HTTPException(status_code=403, detail="Not authorized")
    return cast(list[FileRead], files)
