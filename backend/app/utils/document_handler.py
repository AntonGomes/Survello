from __future__ import annotations

import io
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Callable
import json
from openpyxl import load_workbook

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
    template_string: str
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


def _get_soffice_path() -> str:
    """Get the path to the soffice executable, handling macOS installation location."""
    import shutil
    import platform
    
    # Check if soffice is in PATH
    soffice = shutil.which("soffice")
    if soffice:
        return soffice
    
    # On macOS, check the standard LibreOffice installation path
    if platform.system() == "Darwin":
        macos_path = "/Applications/LibreOffice.app/Contents/MacOS/soffice"
        if Path(macos_path).exists():
            return macos_path
    
    # Fall back to "soffice" and let subprocess raise FileNotFoundError
    return "soffice"


def _run_libreoffice_conversion(input_path: Path, output_dir: Path) -> bytes:
    """Common LibreOffice conversion logic for converting documents to PDF."""
    soffice_path = _get_soffice_path()
    
    # Use a unique user profile to avoid conflicts with running LibreOffice instances
    import uuid
    user_installation = output_dir / f".libreoffice_profile_{uuid.uuid4().hex[:8]}"
    
    try:
        result = subprocess.run(
            [
                soffice_path,
                "--headless",
                f"-env:UserInstallation=file://{user_installation}",
                "--convert-to",
                "pdf",
                "--outdir",
                str(output_dir),
                str(input_path),
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
            text=True,
            timeout=60,  # Prevent hanging on problematic files
        )
    except subprocess.TimeoutExpired as exc:
        raise ConversionError("LibreOffice conversion timed out") from exc
    except FileNotFoundError as exc:
        raise ConversionError(
            "soffice not found. Install LibreOffice: brew install --cask libreoffice (macOS) "
            "or apt-get install libreoffice-writer (Linux)"
        ) from exc
    except Exception as exc:
        raise ConversionError(f"Failed to launch soffice: {exc}") from exc

    if result.returncode != 0:
        raise ConversionError(
            f"LibreOffice conversion failed.\nstdout: {result.stdout}\nstderr: {result.stderr}"
        )

    pdf_candidates = list(output_dir.glob("*.pdf"))
    if not pdf_candidates:
        raise ConversionError(
            f"PDF output not created. LibreOffice may be running in GUI mode.\n"
            f"stdout: {result.stdout}\nstderr: {result.stderr}\n"
            f"Try: Close LibreOffice GUI or run 'pkill -f soffice'"
        )
    return pdf_candidates[0].read_bytes()


def _convert_docx_bytes(data: bytes) -> bytes:
    """Convert DOCX bytes to PDF bytes using LibreOffice."""
    with tempfile.TemporaryDirectory() as td:
        td_path = Path(td)
        in_path = td_path / "input.docx"
        in_path.write_bytes(data)
        return _run_libreoffice_conversion(in_path, td_path)


def _convert_xlsx_bytes(data: bytes) -> bytes:
    """Convert XLSX bytes to PDF bytes using LibreOffice."""
    with tempfile.TemporaryDirectory() as td:
        td_path = Path(td)
        in_path = td_path / "input.xlsx"
        in_path.write_bytes(data)
        return _run_libreoffice_conversion(in_path, td_path)


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


from contextgem import DocxConverter

def _docx_to_md(data) -> str:
    """Convert a DOCX file to markdown or raw text using ContextGem's DocxConverter."""
    with tempfile.TemporaryDirectory() as td:
        path = Path(td) / "input.docx"
        path.write_bytes(data)
        converter = DocxConverter()
        docx_text = converter.convert_to_text_format(
            path,
            output_format="markdown",  # or "raw"
        )
        return docx_text


def _xlsx_to_json_str(data) -> str:
    with tempfile.TemporaryDirectory() as td:
        path = Path(td) / "input.xlsx"
        path.write_bytes(data)

        # read_only=True is essential for speed; data_only=False preserves formulas
        wb = load_workbook(path, data_only=False, read_only=True)
        result = {}

        for name in wb.sheetnames:
            # Fetch up to 101 rows (1 for header + 100 for data) in one go
            data = list(wb[name].iter_rows(max_row=101, values_only=True))
            
            result[name] = {
                "columns": list(data[0]) if data else [],
                "rows": [list(row) for row in data[1:]] # The next 100 rows
            }
        
        # default=str ensures dates and other Excel objects don't break the JSON
        return json.dumps(result, indent=2, default=str)

def convert_to_pdf(name: str, data: bytes) -> bytes:
    """Convert a document (DOCX or XLSX) to PDF bytes."""
    suffix = Path(name).suffix.lower()
    if suffix == ".docx":
        return _convert_docx_bytes(data)
    if suffix == ".xlsx":
        return _convert_xlsx_bytes(data)
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
    
    if Path(template_name).suffix.lower() == ".docx":
        if on_log:
            on_log(f"Converting template {template_name} to markdown...")
        template_string = _docx_to_md(template_bytes)
    elif Path(template_name).suffix.lower() == ".xlsx":
        template_string = _xlsx_to_json_str(template_bytes)

    return PreparedBundle(
        template=PreparedFile(
            name=template_name,
            data=template_bytes,
            mime_type="application/octet-stream",
        ),
        template_string=template_string,
        images=images,
        documents=documents,
    )


def to_file_obj(prepared_file: PreparedFile) -> io.BytesIO:
    """Return a BytesIO with name set for OpenAI uploads."""
    bio = io.BytesIO(prepared_file.data)
    bio.name = prepared_file.name
    return bio
