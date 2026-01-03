from __future__ import annotations

import uuid

from fastapi import APIRouter

from app.api.deps import StorageDep, CurrentUserDep
from app.models.request_models import (
    GetPresignPutsRequest,
    GetPresignPutsResponse,
    PresignedPut,
)

router = APIRouter()


@router.post("/store/presign_uploads", response_model=GetPresignPutsResponse)
def presign_uploads(
    request: GetPresignPutsRequest,
    storage: StorageDep,
    user_id: CurrentUserDep,
):
    """Generate presigned upload URLs for the provided file list."""
    puts: list[PresignedPut] = []

    for file in request.files:
        # Construct a unique storage key
        org_id =  1 # TODO: Fetch org ID from user/session
        storage_key = f"{org_id}/{user_id}/{uuid.uuid4()}-{file.file_name}"

        file.storage_key = storage_key  

        put_url = storage.generate_presigned_url(
            operation="put_object", key=storage_key, content_type=file.mime_type
        )

        puts.append(
            PresignedPut(
                file=file,
                put_url=put_url,
            )
        )

    return GetPresignPutsResponse(puts=puts)
