import os
import shutil
from pathlib import Path

USE_S3 = os.getenv("TEMP_STORAGE", "local") == "s3"

if USE_S3:
    import boto3

    s3 = boto3.client("s3", region_name=os.getenv("AWS_REGION"))
    BUCKET = os.getenv("S3_BUCKET")


def delete_job(job_id: str, jobs: dict):
    job = jobs.pop(job_id, None)
    if not job:
        return

    result_path = job.get("resultPath")
    if not result_path:
        return

    path = Path(result_path)
    if USE_S3:
        s3.delete_object(Bucket=BUCKET, Key=path.name)
        return

    if path.exists():
        shutil.rmtree(path.parent, ignore_errors=True)
