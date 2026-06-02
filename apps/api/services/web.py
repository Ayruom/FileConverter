import os
import re
import tempfile
from pathlib import Path

from docx import Document
from fpdf import FPDF


def _blocked_url_fetcher(url: str, *args, **kwargs):
    raise ValueError("External resources are disabled for HTML conversion")


def _reject_dangerous_html_references(text: str):
    if re.search(r"""(?:src|href)\s*=\s*["']?\s*(?:https?|ftp|file|data):""", text, re.IGNORECASE):
        raise ValueError("External resources are disabled for HTML conversion")
    if re.search(r"""url\(\s*["']?\s*(?:https?|ftp|file|data):""", text, re.IGNORECASE):
        raise ValueError("External resources are disabled for HTML conversion")


def _wrap_text_for_pdf(text: str, width: int = 92) -> list[str]:
    lines: list[str] = []
    for source_line in text.splitlines() or [""]:
        if not source_line:
            lines.append("")
            continue
        while len(source_line) > width:
            split_at = source_line.rfind(" ", 0, width)
            if split_at <= 0:
                split_at = width
            lines.append(source_line[:split_at])
            source_line = source_line[split_at:].lstrip()
        lines.append(source_line)
    return lines


async def html_to_pdf(content: bytes, filename: str) -> tuple[str, str]:
    from weasyprint import HTML

    stem = Path(filename).stem
    out_path = os.path.join(tempfile.mkdtemp(prefix="ff_out_"), f"{stem}.pdf")
    html = content.decode("utf-8", errors="replace")
    _reject_dangerous_html_references(html)
    HTML(string=html, url_fetcher=_blocked_url_fetcher).write_pdf(out_path)
    return out_path, f"{stem}_converted.pdf"


async def txt_to_pdf(content: bytes, filename: str) -> tuple[str, str]:
    text = content.decode("utf-8", errors="replace")
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=12)
    for line in _wrap_text_for_pdf(text):
        pdf.multi_cell(pdf.epw, 8, line)

    stem = Path(filename).stem
    out_path = os.path.join(tempfile.mkdtemp(prefix="ff_out_"), f"{stem}.pdf")
    pdf.output(out_path)
    return out_path, f"{stem}_converted.pdf"


async def txt_to_docx(content: bytes, filename: str) -> tuple[str, str]:
    text = content.decode("utf-8", errors="replace")
    document = Document()
    for line in text.splitlines() or [""]:
        document.add_paragraph(line)

    stem = Path(filename).stem
    out_path = os.path.join(tempfile.mkdtemp(prefix="ff_out_"), f"{stem}.docx")
    document.save(out_path)
    return out_path, f"{stem}_converted.docx"
