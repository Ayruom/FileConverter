from typing import Literal

from pydantic import BaseModel


class JobStatus(BaseModel):
    jobId: str
    status: Literal["queued", "processing", "complete", "error"]
    progress: int
    stage: str
    errorMessage: str | None = None
