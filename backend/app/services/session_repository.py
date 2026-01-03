# backend/app/services/file_repository.py

from __future__ import annotations

from datetime import datetime as dt, timezone as tz, timedelta

from typing import Optional

from sqlalchemy.orm import Session as DBSession

from app.models.orm import Session
from app.models.models import FileRead


class SessionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_session(
        self,
        user_id: int,
        session_token: str,
    ):
        session = Session(user_id=user_id, session_token=session_token)
        self.db.add(session)
        self.db.commit()
        return 

    def get_valid_session(self, session_id: str) -> Session | None:
        session = self.db.get_session(session_id)
        if not session:
            return None
        if session.expires_at < dt.now(tz=tz.utc):
            self.db.delete_session(session_id)
            return None
        return session