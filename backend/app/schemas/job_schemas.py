from pydantic import BaseModel
from typing import Optional, List


class ClientContactRead(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role_title: Optional[str] = None


class ClientRead(BaseModel):
    id: int
    name: str
    contacts: List[ClientContactRead] = []

    class Config:
        orm_mode = True


class JobRead(BaseModel):
    """DTO for reading job information."""

    id: int
    org_id: Optional[int] = None
    client: ClientRead
    created_by_user_id: int
    name: str
    address: Optional[str] = None
    status: Optional[str] = None
    created_at: str
    updated_at: str

    class Config:
        orm_mode = True
