import asyncio
import os
import shutil
import tempfile
import uuid
from pathlib import Path


def _default_libreoffice_bin() -> str:
    for candidate in (
        os.getenv("LIBREOFFICE_BIN"),
        shutil.which("libreoffice"),
        shutil.which("soffice"),
        "/Applications/LibreOffice.app/Contents/MacOS/soffice",
    ):
        if candidate and Path(candidate).exists():
            return candidate
    return "libreoffice"


LIBREOFFICE_BIN = _default_libreoffice_bin()


async def convert_with_libreoffice(content: bytes, filename: str, target_format: str) -> tuple[str, str]:
    job_dir = Path(tempfile.mkdtemp(prefix=f"ff_{uuid.uuid4().hex}_"))
    try:
        input_path = job_dir / Path(filename).name
        input_path.write_bytes(content)

        cmd = [
            LIBREOFFICE_BIN,
            "--headless",
            "--norestore",
            "--nofirststartwizard",
            f"-env:UserInstallation=file://{job_dir}/lo_profile",
            "--convert-to",
            target_format,
            "--outdir",
            str(job_dir),
            str(input_path),
        ]

        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        _stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=120)

        if proc.returncode != 0:
            raise RuntimeError(f"LibreOffice failed: {stderr.decode().strip()}")

        stem = input_path.stem
        output_path = job_dir / f"{stem}.{target_format}"
        if not output_path.exists():
            raise FileNotFoundError(f"Expected output not found: {output_path}")

        out_dir = Path(tempfile.mkdtemp(prefix="ff_out_"))
        out_name = f"{stem}_converted.{target_format}"
        final_path = out_dir / out_name
        shutil.move(str(output_path), str(final_path))
        return str(final_path), out_name
    finally:
        shutil.rmtree(job_dir, ignore_errors=True)
