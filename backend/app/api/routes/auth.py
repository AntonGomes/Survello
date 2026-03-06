from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Cookie, HTTPException, Response
from sqlmodel import select

from app.api.deps import SessionDep
from app.core.security import create_token, hash_password, verify_password
from app.core.settings import get_settings
from app.models.user_model import (
    Org,
    User,
    UserLogin,
    UserRead,
    UserRegister,
    UserRole,
)
from app.models.user_model import (
    Session as DbSession,
)

router = APIRouter()


@router.post("/register", response_model=UserRead, operation_id="registerUser")
def register(user_in: UserRegister, response: Response, db: SessionDep):
    """
    Register a new user and organization.
    """
    settings = get_settings()
    is_whitelisted = user_in.email in settings.test_email_whitelist

    whitelist = settings.registration_whitelist
    not_on_whitelist = whitelist and user_in.email not in whitelist
    if not_on_whitelist:
        raise HTTPException(
            status_code=403,
            detail=(
                "Registration is currently by invitation only."
                " Please join the waitlist."
            ),
        )

    # 1. Check for existing user
    existing_user = db.exec(select(User).where(User.email == user_in.email)).first()
    if existing_user:
        if is_whitelisted:
            db.delete(existing_user)
            db.commit()
        else:
            raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Create Org
    org = Org(name=user_in.org_name)
    db.add(org)
    db.commit()
    db.refresh(org)

    # 3. Create User
    hashed_password = hash_password(user_in.password)
    user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hashed_password,
        org_id=org.id,
        role=UserRole.ADMIN,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 4. Create Session Token
    token = create_token()
    expires = datetime.now(UTC) + timedelta(hours=2)

    # 5. Save Session to DB
    new_session = DbSession(session_token=token, user_id=user.id, expires_at=expires)
    db.add(new_session)
    db.commit()

    # 6. Set Cookie
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",  # Required for cross-origin cookies
        expires=expires,
    )

    return user


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
    expires = datetime.now(UTC) + timedelta(hours=2)

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
        secure=True,
        samesite="none",  # Required for cross-origin cookies
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
