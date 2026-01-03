from __future__ import annotations

import secrets

from fastapi import APIRouter, Response

from app.api.deps import SessionRepoDep, UserRepoDep, CurrentUserDep
from app.schemas.auth_schemas import SignupRequest, LoginRequest


router = APIRouter()

@router.post("/auth/register")
def register(
    request: SignupRequest,
    user_repo: UserRepoDep,
    session_repo: SessionRepoDep,
    response: Response
):
    if user_repo.get_user_by_email(email=request.email):
        return HttpException(status_code=400, detail="Email already registered")
    user = user_repo.create_user(
        name=request.name, 
        email=request.email, 
        hashed_password=hash_password(request.password)
        )
    session_token = secrets.token_urlsafe(32)
    session_repo.create_session(user.id, session_token)
    response.set_cookie(key="session_token", value=session_token, httponly=True, samesite="lax")
    return Response(status_code=201)


@router.post("/auth/login")
def login(
    request: LoginRequest,
    session_repo: SessionRepoDep,
    user_repo: UserRepoDep,
    response: Response
):
    user = user_repo.get_user_by_email(email=request.email)
    if not user or not verify_password(user.password_hash, request.password):
        return HttpException(status_code=401, detail="Invalid credentials")
    session_token = session_repo.create_session(user.id)
    response.set_cookie(key="session_token", value=session_token, httponly=True, samesite="lax")
    return Response(status_code=200)


@router.post("/auth/logout")
def logout(
    response: Response,
    session_repo: SessionRepoDep,
    current_user: CurrentUserDep
):
    session_repo.delete_sessions_for_user(current_user.id)
    response.delete_cookie(key="session_token")
    return Response(status_code=200)


@router.get("/auth/me", response_model=UserResponse)
def me(current_user: CurrentUserDep):
    return current_user