from __future__ import annotations


from fastapi import APIRouter

from app.api.deps import UserRepoDep, CurrentUserDep
from app.schemas.user_schemas import UserRead, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserRead)
def read_user_me(
    current_user: CurrentUserDep,
):
    """
    Get current user.
    """
    return current_user


@router.patch("/me", response_model=UserRead)
def update_user_me(
    user_in: UserUpdate,
    current_user: CurrentUserDep,
    user_repo: UserRepoDep,
):
    """
    Update current user.
    """
    user = user_repo.update_user(current_user.id, user_in)
    return user
