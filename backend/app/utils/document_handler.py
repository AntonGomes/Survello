from __future__ import annotations

import io
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

# import pypandoc  <-- Removed dependency


class ConversionError(Exception):
    """Raised when a file cannot be converted to PDF."""


IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
DOC_EXTS = {".pdf", ".docx", ".xlsx"}
OPEN_XML_EXTS = {".docx", ".xlsx"}


@dataclass
class PreparedFile:
    name: str
    data: bytes
    mime_type: str


@dataclass
class PreparedBundle:
    template: PreparedFile
    images: list[PreparedFile]
    documents: list[PreparedFile]  # PDFs only


def _is_image(name: str) -> bool:
    return Path(name).suffix.lower() in IMAGE_EXTS


def _is_document(name: str) -> bool:
    return Path(name).suffix.lower() in DOC_EXTS


def _is_open_xml(name: str) -> bool:
    return Path(name).suffix.lower() in OPEN_XML_EXTS


def _is_pdf(name: str) -> bool:
    return Path(name).suffix.lower() == ".pdf"


def _convert_docx_bytes(data: bytes) -> bytes:
    with tempfile.TemporaryDirectory() as td:
        in_path = Path(td) / "input.docx"
        out_dir = Path(td)
        in_path.write_bytes(data)

        try:
            result = subprocess.run(
                [
                    "soffice",
                    "--headless",
                    "--convert-to",
                    "pdf",
                    "--outdir",
                    str(out_dir),
                    str(in_path),
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=False,
                text=True,
            )
        except Exception as exc:
            raise ConversionError(
                "Failed to launch soffice for DOCX conversion"
            ) from exc

        if result.returncode != 0:
            raise ConversionError(
                f"LibreOffice conversion failed.\nstdout: {result.stdout}\nstderr: {result.stderr}"
            )

        pdf_candidates = list(out_dir.glob("*.pdf"))
        if not pdf_candidates:
            raise ConversionError("PDF output not created for DOCX")
        return pdf_candidates[0].read_bytes()


def _convert_xlsx_bytes(data: bytes) -> bytes:
    with tempfile.TemporaryDirectory() as td:
        in_path = Path(td) / "input.xlsx"
        out_dir = Path(td)
        in_path.write_bytes(data)
        try:
            result = subprocess.run(
                [
                    "soffice",
                    "--headless",
                    "--convert-to",
                    "pdf",
                    "--outdir",
                    str(out_dir),
                    str(in_path),
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=False,
                text=True,
            )
        except Exception as exc:
            raise ConversionError(
                "Failed to launch soffice for XLSX conversion"
            ) from exc

        if result.returncode != 0:
            raise ConversionError(
                f"LibreOffice conversion failed.\nstdout: {result.stdout}\nstderr: {result.stderr}"
            )

        pdf_candidates = list(out_dir.glob("*.pdf"))
        if not pdf_candidates:
            raise ConversionError("PDF output not created for XLSX")
        return pdf_candidates[0].read_bytes()


def _ensure_pdf(name: str, data: bytes) -> PreparedFile:
    suffix = Path(name).suffix.lower()
    if suffix == ".pdf":
        return PreparedFile(name=name, data=data, mime_type="application/pdf")
    if suffix == ".docx":
        pdf_bytes = _convert_docx_bytes(data)
        return PreparedFile(
            name=Path(name).with_suffix(".pdf").name,
            data=pdf_bytes,
            mime_type="application/pdf",
        )
    if suffix == ".xlsx":
        pdf_bytes = _convert_xlsx_bytes(data)
        return PreparedFile(
            name=Path(name).with_suffix(".pdf").name,
            data=pdf_bytes,
            mime_type="application/pdf",
        )
    raise ConversionError(f"Unsupported file extension for PDF conversion: {name}")


def prepare(
    template: tuple[str, bytes],
    context_files: list[tuple[str, bytes]],
    on_log: Callable[[str], None] | None = None,
    on_progress: Callable[[int, int], None] | None = None,
) -> PreparedBundle:
    """Prepare template/context files in-memory; converts docs to PDF bytes."""
    template_name, template_bytes = template

    images: list[PreparedFile] = []
    documents: list[PreparedFile] = []

    total_files = len(context_files)

    # Initial progress
    if on_progress:
        on_progress(0, total_files)

    for i, (name, data) in enumerate(context_files):
        if on_log:
            on_log(f"Processing file {i + 1}/{total_files}: {name}")

        if _is_image(name):
            images.append(
                PreparedFile(name=name, data=data, mime_type="application/octet-stream")
            )
        elif _is_document(name):
            if on_log:
                on_log(f"Converting {name} to PDF...")
            documents.append(_ensure_pdf(name, data))

        # Update progress after each file
        if on_progress:
            on_progress(i + 1, total_files)

    return PreparedBundle(
        template=PreparedFile(
            name=template_name,
            data=template_bytes,
            mime_type="application/octet-stream",
        ),
        images=images,
        documents=documents,
    )


def to_file_obj(prepared_file: PreparedFile) -> io.BytesIO:
    """Return a BytesIO with name set for OpenAI uploads."""
    bio = io.BytesIO(prepared_file.data)
    bio.name = prepared_file.name
    return bio
