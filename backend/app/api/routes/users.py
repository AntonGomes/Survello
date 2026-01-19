from fastapi import APIRouter, HTTPException
from typing import Any
from sqlmodel import select

from app.api.deps import DBDep, CurrentUserDep
from app.models.user_model import User, UserRead, UserUpdate
from app.core.security import hash_password

router = APIRouter()


@router.get("/me", response_model=UserRead, operation_id="readUserMe")
def read_user_me(current_user: CurrentUserDep):
    """
    Get current user.
    """
    return current_user


@router.patch("/me", response_model=UserRead, operation_id="updateUserMe")
def update_user_me(
    user_in: UserUpdate, current_user: CurrentUserDep, db: DBDep
) -> UserRead:
    """
    Update own profile.
    """
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data: dict[str, Any] = {}
    if "password" in user_data:
        hashed_password = hash_password(user_data["password"])
        extra_data["password_hash"] = hashed_password
    current_user.sqlmodel_update(user_data, update=extra_data)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user  # pyright: ignore[reportReturnType]
