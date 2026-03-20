from datetime import datetime

from app.models.job_model import JobBase


class JobReadMinimal(JobBase):
    id: int
    created_at: datetime
    updated_at: datetime
