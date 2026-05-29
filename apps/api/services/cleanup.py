import asyncio
import os
import shutil
import tempfile
import time
from pathlib import Path

from utils.storage import delete_job


JOB_TTL_SECONDS = int(os.getenv("CLEANUP_TTL_MINUTES", "10")) * 60
TEMP_FILE_TTL_SECONDS = int(os.getenv("TEMP_FILE_TTL_MINUTES", "60")) * 60
CLEANUP_INTERVAL_SECONDS = int(os.getenv("CLEANUP_INTERVAL_SECONDS", "300"))
TEMP_DIR_PREFIXES = ("ff_",)


def schedule_cleanup(job_id: str, jobs: dict):
    delete_job(job_id, jobs)


def mark_job(status: str, progress: int, stage: str, **extra):
    now = time.time()
    created_at = extra.pop("createdAt", None) or now
    return {
        "status": status,
        "progress": progress,
        "stage": stage,
        "createdAt": created_at,
        "updatedAt": now,
        **extra,
    }


def cleanup_expired_jobs(jobs: dict):
    now = time.time()
    for job_id, job in list(jobs.items()):
        touched_at = job.get("updatedAt") or job.get("createdAt") or now
        if now - touched_at >= JOB_TTL_SECONDS:
            delete_job(job_id, jobs)


def cleanup_stale_temp_dirs():
    temp_root = Path(tempfile.gettempdir())
    if not temp_root.exists():
        return

    cutoff = time.time() - TEMP_FILE_TTL_SECONDS
    for entry in temp_root.iterdir():
        if not entry.is_dir() or not entry.name.startswith(TEMP_DIR_PREFIXES):
            continue
        try:
            if entry.stat().st_mtime <= cutoff:
                shutil.rmtree(entry, ignore_errors=True)
        except FileNotFoundError:
            continue


async def run_periodic_cleanup(jobs: dict, stop_event: asyncio.Event):
    while not stop_event.is_set():
        cleanup_expired_jobs(jobs)
        cleanup_stale_temp_dirs()
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=CLEANUP_INTERVAL_SECONDS)
        except TimeoutError:
            continue
