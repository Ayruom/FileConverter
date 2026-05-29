import os
import tempfile
import zipfile
from pathlib import Path

import fitz
from docx import Document


async def pdf_to_image(content: bytes, filename: str, fmt: str) -> tuple[str, str]:
    doc = fitz.open(stream=content, filetype="pdf")
    stem = Path(filename).stem
    fmt = fmt.lower().replace("jpeg", "jpg")
    pix_fmt = "jpeg" if fmt == "jpg" else "png"

    if len(doc) == 1:
        page = doc[0]
        pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
        out_path = os.path.join(tempfile.mkdtemp(prefix="ff_out_"), f"{stem}.{fmt}")
        pix.save(out_path, output=pix_fmt)
        return out_path, f"{stem}_converted.{fmt}"

    out_dir = tempfile.mkdtemp(prefix="ff_out_")
    zip_path = os.path.join(out_dir, f"{stem}_pages.zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for index, page in enumerate(doc):
            pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
            zf.writestr(f"page_{index + 1:03d}.{fmt}", pix.tobytes(output=pix_fmt))
    return zip_path, f"{stem}_pages.zip"


async def pdf_to_text(content: bytes, filename: str) -> tuple[str, str]:
    doc = fitz.open(stream=content, filetype="pdf")
    text = "\n\n".join(page.get_text() for page in doc)
    stem = Path(filename).stem
    out_path = os.path.join(tempfile.mkdtemp(prefix="ff_out_"), f"{stem}.txt")
    Path(out_path).write_text(text, encoding="utf-8")
    return out_path, f"{stem}_converted.txt"


async def pdf_to_docx(content: bytes, filename: str) -> tuple[str, str]:
    doc = fitz.open(stream=content, filetype="pdf")
    document = Document()

    for page_number, page in enumerate(doc, start=1):
        if page_number > 1:
            document.add_page_break()
        text = page.get_text().strip()
        if text:
            for paragraph in text.split("\n\n"):
                document.add_paragraph(paragraph.replace("\n", " "))
        else:
            document.add_paragraph(f"Page {page_number} did not contain selectable text.")

    stem = Path(filename).stem
    out_path = os.path.join(tempfile.mkdtemp(prefix="ff_out_"), f"{stem}.docx")
    document.save(out_path)
    return out_path, f"{stem}_converted.docx"


async def pdf_to_html(content: bytes, filename: str) -> tuple[str, str]:
    doc = fitz.open(stream=content, filetype="pdf")
    html_parts = ["<html><body>"]
    for page in doc:
        html_parts.append(page.get_text("html"))
        html_parts.append("<hr>")
    html_parts.append("</body></html>")

    stem = Path(filename).stem
    out_path = os.path.join(tempfile.mkdtemp(prefix="ff_out_"), f"{stem}.html")
    Path(out_path).write_text("\n".join(html_parts), encoding="utf-8")
    return out_path, f"{stem}_converted.html"
