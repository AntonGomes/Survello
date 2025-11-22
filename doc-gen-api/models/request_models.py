from pydantic import BaseModel
from typing import List


class ProcessRequest(BaseModel):
    template: str
    context: List[str]
