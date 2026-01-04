from __future__ import annotations


from fastapi import APIRouter, Response, HTTPException, status

from app.api.deps import SessionRepoDep, UserRepoDep, CurrentUserDep
from app.core.security import verify_password, create_session_token
from app.schemas.auth_schemas import (
    SignupRequest,
    LoginRequest,
    MessageResponse,
)
from app.schemas.user_schemas import UserCreate, UserRead


router = APIRouter()


@router.post(
    "/register",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    operation_id="register",
)
def register(
    request: SignupRequest,
    user_repo: UserRepoDep,
    session_repo: SessionRepoDep,
    response: Response,
):
    if user_repo.get_by_email(email=request.email):
        return HTTPException(status_code=400, detail="Email already registered")

    user_in = UserCreate(
        name=request.name, email=request.email, password=request.password
    )
    user = user_repo.create_user(user_in)

    session_token = create_session_token()
    session_repo.create_session(user.id, session_token)

    # Set cookie on the injected response object
    response.set_cookie(
        key="session_token", value=session_token, httponly=True, samesite="lax"
    )
    return MessageResponse(message="Registration successful")


@router.post("/login", response_model=MessageResponse, operation_id="login")
def login(
    request: LoginRequest,
    session_repo: SessionRepoDep,
    user_repo: UserRepoDep,
    response: Response,
):
    user = user_repo.get_by_email(email=request.email)
    if not user or not verify_password(request.password, user.password_hash):
        return HTTPException(status_code=401, detail="Invalid credentials")
    session_token = create_session_token()
    session_repo.create_session(user.id, session_token)

    # Set cookie on the injected response object
    response.set_cookie(
        key="session_token", value=session_token, httponly=True, samesite="lax"
    )

    return MessageResponse(message="Login successful")


@router.post("/logout", operation_id="logout")
def logout(
    response: Response, session_repo: SessionRepoDep, current_user: CurrentUserDep
):
    session_repo.delete_sessions_for_user(current_user.id)
    response.delete_cookie(key="session_token")
    return MessageResponse(message="Logout successful")


@router.get("/me", response_model=UserRead, operation_id="getCurrentUser")
def me(current_user: CurrentUserDep):
    return current_user
