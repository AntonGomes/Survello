from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.api.deps import StorageDep, CurrentUserDep, DBDep
from app.models.file_model import (
    File,
    FileCreate,
    FilePresignRequest,
    FilePresignResponse,
    FileRead,
)

router = APIRouter()


@router.post("/presign", response_model=list[FilePresignResponse])
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
        storage_key = f"{user.org_id}/{user.id}/{f.client_id}-{f.file_name}"

        url = storage.generate_presigned_url(
            "put_object",
            storage_key=storage_key,
            mime_type=f.mime_type,
            file_name=f.file_name,
        )

        extra_data = {"storage_key": storage_key, "put_url": url}
        response.append(FilePresignResponse.model_validate(f, update=extra_data))

    return response


@router.post("/", response_model=FileRead, status_code=status.HTTP_201_CREATED)
def create_file(
    file_in: FileCreate,
    db: DBDep,
    storage: StorageDep,
    user: CurrentUserDep,
) -> FileRead:
    """
    Standard Create Endpoint.
    Client calls this AFTER successfully uploading to the presigned URL.
    """
    extra_data = {"uploaded_by_user_id": user.id, "org_id": user.org_id}
    if not storage.check_file_exists(file_in.storage_key):
        raise HTTPException(400, "File verification failed. Upload not found.")
    db_file = File.model_validate(file_in, update=extra_data)
    db.add(db_file)

    db.commit()
    db.refresh(db_file)

    return db_file  # pyright: ignore[reportReturnType]


@router.post("/", response_model=list[FileRead], status_code=status.HTTP_201_CREATED)
def create_files(
    files_in: list[FileCreate],
    db: DBDep,
    storage: StorageDep,
    user: CurrentUserDep,
) -> list[FileRead]:
    """
    Create Endpoint for multiple files.
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

    return files  # pyright: ignore[reportReturnType]


@router.get("/{file_id}", response_model=FileRead)
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


@router.get("/", response_model=list[FileRead])
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
