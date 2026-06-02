import os
import re
from pathlib import Path

from fastapi import HTTPException, UploadFile

try:
    import magic
except ImportError:
    magic = None

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/html",
    "text/csv",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/heic",
    "image/heif",
    "image/svg+xml",
    "application/rtf",
    "application/zip",
    "application/vnd.oasis.opendocument.text",
    "application/vnd.oasis.opendocument.presentation",
    "application/vnd.oasis.opendocument.spreadsheet",
}

ALLOWED_EXTENSIONS = {
    "pdf",
    "doc",
    "docx",
    "ppt",
    "pptx",
    "xls",
    "xlsx",
    "csv",
    "txt",
    "html",
    "htm",
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
    "bmp",
    "tiff",
    "heic",
    "heif",
    "svg",
    "rtf",
    "odt",
    "odp",
}

ALLOWED_TARGETS = {
    "pdf",
    "docx",
    "pptx",
    "xlsx",
    "txt",
    "html",
    "jpg",
    "jpeg",
    "png",
    "webp",
    "csv",
    "odt",
    "svg",
}

MAX_FILE_SIZE_BYTES = int(os.getenv("MAX_FILE_MB", "100")) * 1024 * 1024
MAX_FILENAME_LENGTH = 120
UPLOAD_READ_CHUNK_BYTES = 1024 * 1024


def sanitize_filename(filename: str) -> str:
    fallback = "upload"
    path = Path(filename or fallback)
    stem = re.sub(r"[^A-Za-z0-9._-]+", "_", path.stem).strip("._-") or fallback
    suffix = re.sub(r"[^A-Za-z0-9.]+", "", path.suffix.lower())
    sanitized = f"{stem[:MAX_FILENAME_LENGTH]}{suffix}"
    return sanitized or fallback


def validate_file(file: UploadFile, target_format: str):
    if file.size and file.size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail=f"File exceeds {MAX_FILE_SIZE_BYTES // 1024 // 1024}MB limit")

    filename = sanitize_filename(file.filename or "")
    ext = Path(filename).suffix.lower().lstrip(".")
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="File extension is not supported")

    header = file.file.read(2048)
    file.file.seek(0)

    if magic is not None:
        detected_mime = magic.from_buffer(header, mime=True)
        if detected_mime not in ALLOWED_MIME_TYPES:
            raise HTTPException(status_code=400, detail=f"File type not supported: {detected_mime}")

    if target_format.lower() not in ALLOWED_TARGETS:
        raise HTTPException(status_code=400, detail=f"Target format not supported: {target_format}")


async def read_upload_with_limit(file: UploadFile, limit_bytes: int = MAX_FILE_SIZE_BYTES) -> bytes:
    chunks: list[bytes] = []
    total = 0

    while True:
        chunk = await file.read(UPLOAD_READ_CHUNK_BYTES)
        if not chunk:
            break
        total += len(chunk)
        if total > limit_bytes:
            raise HTTPException(status_code=400, detail=f"File exceeds {limit_bytes // 1024 // 1024}MB limit")
        chunks.append(chunk)

    return b"".join(chunks)
