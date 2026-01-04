from typing import Optional
from sqlalchemy.orm import Session
from app.db.models.user_model import User
from app.core.enums import UserRole
from app.schemas.user_schemas import UserCreate, UserUpdate, UserRead
from app.core.security import hash_password


class UserRepository:
    """Encapsulates all database access related to User models."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[UserRead]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[UserRead]:
        return self.db.query(User).filter(User.email == email).first()

    def create_user(self, user_in: UserCreate) -> UserRead:
        """Creates a new user. Assumes user does not exist."""
        new_user = User(
            org_id=None,  # Default to None for now until orgs are implemented
            role=user_in.role or UserRole.MEMBER,
            email=user_in.email,
            name=user_in.name,
            password_hash=hash_password(user_in.password),
        )
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        return new_user

    def update_user(self, user_id: int, user_in: UserUpdate) -> Optional[UserRead]:
        user = self.get_by_id(user_id)
        if not user:
            return None

        update_data = user_in.model_dump(exclude_unset=True)
        if "password" in update_data:
            password = update_data.pop("password")
            user.password_hash = hash_password(password)

        for field, value in update_data.items():
            setattr(user, field, value)

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
