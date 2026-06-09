import asyncio
import io

import pytest
from fastapi import HTTPException, UploadFile

from services.image import _reject_external_svg_references
from services.web import _reject_dangerous_html_references
from utils.security import MAX_FILENAME_LENGTH, read_upload_with_limit, sanitize_filename


def test_sanitize_filename_strips_path_traversal():
    assert sanitize_filename("../../etc/passwd.pdf") == "passwd.pdf"
    assert "/" not in sanitize_filename("..\\..\\secret.docx")


def test_sanitize_filename_limits_long_unicode_names():
    sanitized = sanitize_filename("résumé " + ("x" * 300) + ".pdf")

    assert sanitized.endswith(".pdf")
    assert len(sanitized.removesuffix(".pdf")) <= MAX_FILENAME_LENGTH
    assert sanitized.startswith("r_sum")


def test_read_upload_with_limit_enforces_size_without_upload_size():
    upload = UploadFile(filename="large.txt", file=io.BytesIO(b"abcdef"))
    upload.size = None

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(read_upload_with_limit(upload, limit_bytes=5))

    assert exc_info.value.status_code == 400


@pytest.mark.parametrize(
    "html",
    [
        '<img src="http://127.0.0.1:8080/private">',
        '<a href="file:///etc/passwd">x</a>',
        "<style>body{background:url(https://example.com/a.png)}</style>",
        '<iframe src="data:text/html,hello"></iframe>',
    ],
)
def test_html_external_references_are_rejected(html):
    with pytest.raises(ValueError, match="External resources are disabled"):
        _reject_dangerous_html_references(html)


@pytest.mark.parametrize(
    "svg",
    [
        b'<svg><image href="http://169.254.169.254/latest/meta-data"/></svg>',
        b'<svg><use href="file:///etc/passwd"/></svg>',
        b"<svg><style>rect{fill:url(https://example.com/pattern.svg)}</style></svg>",
        b'<svg><image src="data:image/png;base64,AAAA"/></svg>',
    ],
)
def test_svg_external_references_are_rejected(svg):
    with pytest.raises(ValueError, match="External resources are disabled"):
        _reject_external_svg_references(svg)
