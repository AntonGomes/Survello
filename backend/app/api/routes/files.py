from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException

from app.api.deps import StorageDep, CurrentUserDep, FileRepoDep
from app.schemas.file_schemas import (
    GetPresignPutsRequest,
    GetPresignPutsResponse,
    PresignedPut,
    FileInput,
    RegisterFilesRequest,
    RegisterFilesResponse,
    FileCreate,
    FileRead,
)

router = APIRouter()


@router.post(
    "/presign_uploads",
    response_model=GetPresignPutsResponse,
    operation_id="presignUploads",
)
def presign_uploads(
    request: GetPresignPutsRequest,
    storage: StorageDep,
    user: CurrentUserDep,
):
    """Generate presigned URLs for uploading files."""
    puts = []
    for file in request.files:
        org_id = user.org_id if user.org_id else "no_org"
        file_uuid = uuid.uuid4()
        storage_key = f"{org_id}/{user.id}/{file_uuid}-{file.file_name}"


        file_input = FileInput(
            file_name=file.file_name,
            mime_type=file.mime_type,
            role=file.role,
            storage_key=storage_key,
        )
        put_url = storage.generate_presigned_url("put_object", file=file_input)

        puts.append(
            PresignedPut(
                file=file_input,
                put_url=put_url,
            )
        )

    return GetPresignPutsResponse(puts=puts)


@router.post(
    "/register", response_model=RegisterFilesResponse, operation_id="registerFiles"
)
def register_files(
    request: RegisterFilesRequest,
    storage: StorageDep,
    file_repo: FileRepoDep,
    user: CurrentUserDep,
):
    """Register uploaded files in the database after verification."""
    registered_files = []
    for file_input in request.files:
        # Verify file exists in storage
        if not storage.check_file_exists(file_input.storage_key):
            raise HTTPException(
                status_code=400,
                detail=f"File not found in storage: {file_input.storage_key}",
            )

        # Create DB record
        file_create = FileCreate(
            **file_input.model_dump(), owner_user_id=user.id, org_id=user.org_id
        )
        file_record = file_repo.create(file_create)
        registered_files.append(FileRead.model_validate(file_record))

    return RegisterFilesResponse(files=registered_files)
