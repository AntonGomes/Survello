from pydantic import BaseModel


# --------------------------------------
# Client Schemas
# --------------------------------------
class ClientBase(BaseModel):
    """Shared attributes for Client models."""

    name: str
    address: str


class ClientRead(ClientBase):
    """For reading Client metadata."""

    id: int
    created_at: str
    updated_at: str


class ClientCreate(ClientBase):
    """Attributes required to create a new Client."""

    pass
