from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.models.request_models import UserUpsertRequest, UserUpsertResponse
from app.models.orm import User


router = APIRouter()


@router.put("/users/upsert/{external_id}")
def upsert_user(
    external_id: str,
    request: UserUpsertRequest,
    db: Session = Depends(get_db),
) -> UserUpsertResponse:
    stmt = (
        insert(User)
        .values(
            id=uuid.uuid4(),
            external_id=external_id,
            email=request.email,
            username=request.name,  
            org_id=None,
        )
        .on_conflict_do_update(
            index_elements=[User.external_id],
            set_={
                "email": request.email,
                "username": request.name,
            },
        )
        .returning(User.id)
    )

    user_id = db.execute(stmt).scalar_one()
    db.commit()

    return UserUpsertResponse(id=str(user_id))
