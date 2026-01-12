from typing import Annotated
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Response, HTTPException, Cookie
from app.api.deps import SessionDep
from app.core.security import verify_password, create_token
from app.models.user_model import UserLogin, User, Session as DbSession
from sqlmodel import select

router = APIRouter()


@router.post("/login", operation_id="loginUser")
def login(login_data: UserLogin, response: Response, db: SessionDep):
    # 1. Verify User
    statement = select(User).where(User.email == login_data.email)
    user = db.exec(statement).first()

    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    assert user.id is not None

    # 2. Create Session Token
    token = create_token()  # UUID or Hex string
    expires = datetime.now(timezone.utc) + timedelta(hours=2)

    # 3. Save Session to DB
    new_session = DbSession(session_token=token, user_id=user.id, expires_at=expires)
    db.add(new_session)
    user_id = user.id
    db.commit()

    # 4. Set Cookie
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,  # Set False only for localhost dev
        samesite="lax",
        expires=expires,
    )

    return {"message": "Login Successful", "user": user_id}


@router.post("/logout", operation_id="logoutUser")
def logout(
    response: Response,
    db: SessionDep,
    session_token: Annotated[str | None, Cookie()] = None,
):
    if session_token:
        # Delete ONLY the session associated with this cookie
        statement = select(DbSession).where(DbSession.session_token == session_token)
        session_record = db.exec(statement).first()
        if session_record:
            db.delete(session_record)
            db.commit()

    # Clear the cookie from the browser
    response.delete_cookie("session_token")
    return {"message": "Logged out successfully"}
