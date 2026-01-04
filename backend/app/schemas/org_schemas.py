from pydantic import BaseModel


# --------------------------------------
# Organization Schemas
# --------------------------------------
class OrgBase(BaseModel):
    """Shared attributes for Org models."""

    name: str
    address: str


class OrgRead(OrgBase):
    """For reading Org metadata."""

    id: int
    created_at: str
    updated_at: str


class OrgCreate(OrgBase):
    """Attributes required to create a new Org."""

    pass
