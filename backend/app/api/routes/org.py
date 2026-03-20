from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.api.deps import CurrentUserDep, DBDep
from app.core.security import hash_password
from app.models.user_model import (
    OrgReadWithUsers,
    OrgUserRead,
    User,
    UserRead,
    UserRole,
    UserUpdate,
)

router = APIRouter()


@router.get("/", response_model=OrgReadWithUsers, operation_id="readOrg")
def read_org(current_user: CurrentUserDep, db: DBDep):
    """
    Get current user's organization with all members.
    """
    db.refresh(current_user, ["org"])
    org = current_user.org

    # Get all users in the org
    users = db.exec(
        select(User).where(User.org_id == org.id).order_by(User.created_at)
    ).all()

    org_users = [
        OrgUserRead(
            id=u.id,
            name=u.name,
            email=u.email,
            role=u.role,
            created_at=u.created_at,
        )
        for u in users
    ]

    return OrgReadWithUsers(
        id=org.id,
        name=org.name,
        created_at=org.created_at,
        users=org_users,
    )


@router.patch("/users/{user_id}", response_model=UserRead, operation_id="updateOrgUser")
def update_org_user(
    user_id: int,
    user_in: UserUpdate,
    current_user: CurrentUserDep,
    db: DBDep,
):
    """
    Update a user in the organization. Admin only.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can update users")

    user = db.exec(
        select(User).where(
            User.id == user_id,
            User.org_id == current_user.org_id,
        )
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent demoting the last admin
    if user_in.role == UserRole.MEMBER and user.role == UserRole.ADMIN:
        admin_count = db.exec(
            select(User).where(
                User.org_id == current_user.org_id,
                User.role == UserRole.ADMIN,
            )
        ).all()
        if len(admin_count) <= 1:
            raise HTTPException(status_code=400, detail="Cannot remove the last admin")

    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        extra_data["password_hash"] = hash_password(user_data.pop("password"))

    user.sqlmodel_update(user_data, update=extra_data)
    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.delete("/users/{user_id}", operation_id="removeOrgUser")
def remove_org_user(
    user_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
):
    """
    Remove a user from the organization. Admin only.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can remove users")

    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself")

    user = db.exec(
        select(User).where(
            User.id == user_id,
            User.org_id == current_user.org_id,
        )
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent removing the last admin
    if user.role == UserRole.ADMIN:
        admin_count = db.exec(
            select(User).where(
                User.org_id == current_user.org_id,
                User.role == UserRole.ADMIN,
            )
        ).all()
        if len(admin_count) <= 1:
            raise HTTPException(status_code=400, detail="Cannot remove the last admin")

    db.delete(user)
    db.commit()

    return {"message": "User removed"}
