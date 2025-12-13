from typing import Literal
from pydantic import BaseModel


class UploadPayloadItem(BaseModel):
    type: Literal["input_image", "input_file"]
    file_id: str


class ClientContainerBundle(BaseModel):
    container_id: str
    template_container_file_id: str
    payload: list[UploadPayloadItem]
