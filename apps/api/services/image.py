import io
import os
import tempfile
from pathlib import Path

from PIL import Image

FORMAT_MAP = {
    "jpg": "JPEG",
    "jpeg": "JPEG",
    "png": "PNG",
    "webp": "WEBP",
    "bmp": "BMP",
    "tiff": "TIFF",
    "gif": "GIF",
}


async def image_convert(content: bytes, filename: str, target: str) -> tuple[str, str]:
    img = Image.open(io.BytesIO(content))
    stem = Path(filename).stem
    target = target.lower().replace("jpeg", "jpg")
    pil_fmt = FORMAT_MAP[target]

    if pil_fmt == "JPEG" and img.mode in ("RGBA", "LA", "P"):
        if img.mode == "P":
            img = img.convert("RGBA")
        background = Image.new("RGB", img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
        img = background
    elif pil_fmt != "PNG":
        img = img.convert("RGB")

    out_path = os.path.join(tempfile.mkdtemp(prefix="ff_out_"), f"{stem}.{target}")
    save_kwargs = {"quality": 92, "optimize": True} if pil_fmt == "JPEG" else {}
    img.save(out_path, format=pil_fmt, **save_kwargs)
    return out_path, f"{stem}_converted.{target}"


async def image_to_pdf(content: bytes, filename: str) -> tuple[str, str]:
    from fpdf import FPDF

    img = Image.open(io.BytesIO(content))
    if img.mode in ("RGBA", "LA", "P"):
        img = img.convert("RGB")

    width_mm = img.width * 0.264583
    height_mm = img.height * 0.264583
    pdf = FPDF(unit="mm", format=(width_mm, height_mm))
    pdf.add_page()

    tmp_dir = tempfile.mkdtemp(prefix="ff_img_")
    tmp_img = os.path.join(tmp_dir, "src.jpg")
    img.save(tmp_img, format="JPEG", quality=92)
    pdf.image(tmp_img, x=0, y=0, w=width_mm, h=height_mm)

    stem = Path(filename).stem
    out_path = os.path.join(tempfile.mkdtemp(prefix="ff_out_"), f"{stem}.pdf")
    pdf.output(out_path)
    return out_path, f"{stem}_converted.pdf"


async def heic_to_jpg(content: bytes, filename: str, target: str) -> tuple[str, str]:
    from pillow_heif import register_heif_opener

    register_heif_opener()
    img = Image.open(io.BytesIO(content)).convert("RGB")
    stem = Path(filename).stem
    fmt = target.lower() if target.lower() in ("jpg", "png") else "jpg"
    out_path = os.path.join(tempfile.mkdtemp(prefix="ff_out_"), f"{stem}.{fmt}")
    img.save(out_path, format=FORMAT_MAP[fmt], quality=92)
    return out_path, f"{stem}_converted.{fmt}"


async def svg_convert(content: bytes, filename: str, target: str) -> tuple[str, str]:
    import cairosvg

    stem = Path(filename).stem
    target = target.lower()
    out_path = os.path.join(tempfile.mkdtemp(prefix="ff_out_"), f"{stem}.{target}")
    if target == "png":
        cairosvg.svg2png(bytestring=content, write_to=out_path, scale=2.0)
    elif target == "pdf":
        cairosvg.svg2pdf(bytestring=content, write_to=out_path)
    else:
        raise ValueError(f"Unsupported SVG target: {target}")
    return out_path, f"{stem}_converted.{target}"
