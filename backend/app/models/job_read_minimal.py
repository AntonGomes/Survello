from app.models.job_model import JobBase
from datetime import datetime


class JobReadMinimal(JobBase):
    id: int
    created_at: datetime
    updated_at: datetime
