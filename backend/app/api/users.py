from __future__ import annotations


from fastapi import APIRouter, Response

from app.api.deps import UserRepoDep, CurrentExternalIdDep
from app.models.request_models import UserUpsertRequest


router = APIRouter()


@router.post("/users/sync")
def sync_user(
    request: UserUpsertRequest,
    user_repo: UserRepoDep,
    external_id: CurrentExternalIdDep,
):
    """
    Ensures the user exists in the database.
    Idempotent: If user exists, does nothing. If not, creates them.
    """
    if not user_repo.get_user_id_by_external_id(external_id):
        user_repo.create_user(external_id=external_id, request=request)
    return Response(status_code=200)
