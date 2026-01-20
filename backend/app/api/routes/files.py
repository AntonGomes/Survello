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
)
from app.utils.conversion import to_pdf, ConversionError, DOCX_MIME, XLSX_MIME

logger = logging.getLogger(__name__)

router = APIRouter()


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
            project_id=db_file.project_id,
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
        storage_key = f"{user.org_id}/{user.id}/{f.client_id}-{f.file_name}-{uuid4()}"

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

    # Generate PDF preview for Office documents
    _maybe_generate_preview(db_file, storage, db, user.id, user.org_id)  # pyright: ignore[reportArgumentType]
    db.refresh(db_file)

    return db_file  # pyright: ignore[reportReturnType]


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
            raise HTTPException(400, "File verification failed. Upload not found.")
        db_file = File.model_validate(file_in_item, update=extra_data)
        db.add(db_file)
        files.append(db_file)

    db.commit()
    for f in files:
        db.refresh(f)

    # Generate PDF previews for Office documents
    for f in files:
        _maybe_generate_preview(f, storage, db, user.id, user.org_id)  # pyright: ignore[reportArgumentType]
        db.refresh(f)

    return files  # pyright: ignore[reportReturnType]


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
    return file  # pyright: ignore[reportReturnType]


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
    return files  # pyright: ignore[reportReturnType]
