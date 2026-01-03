from typing import Literal, Union, Optional
from pydantic import BaseModel
from app.models.orm import FileRole


class FileRead(BaseModel):
    """DTO for file metadata passed from frontend to backend services."""

    id: Optional[int] = None
    storage_key: Optional[str] = None
    file_name: str
    mime_type: str
    role: FileRole
    data: Optional[bytes] = None

    class Config:
        use_enum_values = True
        from_attributes = True


class InputImage(BaseModel):
    type: Literal["input_image"] = "input_image"
    image_url: str


class InputFile(BaseModel):
    type: Literal["input_file"] = "input_file"
    file_url: str


UploadPayloadItem = Union[InputImage, InputFile]


class LLMClientContainerBundle(BaseModel):
    container_id: str
    template_container_file_id: str
