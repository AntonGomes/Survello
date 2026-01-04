from pydantic import BaseModel


# --------------------------------------
# Auth Schemas
# --------------------------------------
class SignupRequest(BaseModel):
    email: str
    password: str
    name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class MessageResponse(BaseModel):
    message: str
