from __future__ import annotations

import uuid
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.models.orm import User
from app.models.request_models import UserUpsertRequest


class UserRepository:
    """Encapsulates all database access related to User models."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_user_id_by_external_id(self, external_id: str) -> uuid.UUID | None:
        """Returns the internal UUID or None."""
        return self.db.query(User.id).filter(User.external_id == external_id).scalar()

    def create_user(self, external_id: str, request: UserUpsertRequest) -> uuid.UUID:
        """Creates a new user. Assumes user does not exist."""
        new_user = User(
            id=uuid.uuid4(),
            external_id=external_id,
            email=request.email,
            username=request.name,
        )
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        return new_user.id


    
