from datetime import datetime as dt, timezone as tz, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.db.models.user_model import Session as UserSession


class SessionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_session(
        self,
        user_id: int,
        session_token: str,
    ) -> UserSession:
        # Default expiry 30 days from now
        expires_at = dt.now(tz=tz.utc) + timedelta(hours=2)
        session = UserSession(
            user_id=user_id, session_token=session_token, expires_at=expires_at
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def delete_sessions_for_user(self, user_id: int) -> None:
        self.db.query(UserSession).filter(UserSession.user_id == user_id).delete()
        self.db.commit()

    def get_valid_session(self, session_token: str) -> Optional[UserSession]:
        session = (
            self.db.query(UserSession)
            .filter(UserSession.session_token == session_token)
            .first()
        )
        if not session:
            print("No session found for token:", session_token)
            return None

        # Ensure timezone awareness
        now = dt.now(tz=tz.utc)
        if session.expires_at.tzinfo is None:
            # Assume stored time is UTC if naive
            session_expires_at = session.expires_at.replace(tzinfo=tz.utc)
        else:
            session_expires_at = session.expires_at

        if session_expires_at < now:
            self.db.delete(session)
            self.db.commit()
            return None

        return session
