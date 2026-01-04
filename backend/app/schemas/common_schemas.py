from typing import Literal, Union
from pydantic import BaseModel


# --------------------------------------
# Common Schemas
# --------------------------------------
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
