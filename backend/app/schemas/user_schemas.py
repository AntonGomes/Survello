from typing import Optional, Literal
from pydantic import BaseModel, EmailStr


# --------------------------------------
# User Schemas
# --------------------------------------
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: Optional[Literal["user", "admin"]] = "user"


class UserRead(UserBase):
    id: int
    org_id: Optional[int] = None

    class Config:
        from_attributes = True


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[Literal["user", "admin"]] = None
