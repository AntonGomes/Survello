from typing import List, Optional
from pydantic import BaseModel


# --------------------------------------
# Run Schemas
# --------------------------------------
class StartRunRequest(BaseModel):
    template_id: int
    context_file_ids: List[int] = []
    job_id: Optional[int] = None


class StartRunResponse(BaseModel):
    run_id: int


class RunStatusResponse(BaseModel):
    run_id: int
    status: str
    upload_progress: int
    model_responses: List[str]


class LatestArtefactResponse(BaseModel):
    download_url: str
    preview_url: str
