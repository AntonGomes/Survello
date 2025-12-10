from __future__ import annotations

import subprocess
import tokenize
from io import StringIO
from pathlib import Path

import pypandoc

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
DOC_EXTS = {".pdf", ".docx", ".xlsx"}
OPEN_XML_EXTS = {".docx", ".xlsx"}


def is_image(path: Path) -> bool:
    return path.suffix.lower() in IMAGE_EXTS


def is_document(path: Path) -> bool:
    return path.suffix.lower() in DOC_EXTS

def is_open_xml(path: Path) -> bool:
    return path.suffix.lower() in OPEN_XML_EXTS

def is_pdf(path: Path) -> bool:
    return path.suffix.lower() == ".pdf"



class ConversionError(Exception):
    """Raised when a file cannot be converted to PDF."""


def convert_docx_to_pdf(path: Path) -> Path:
    out = path.with_suffix(".pdf")

    try:
        pypandoc.convert_file(
            str(path),
            "pdf",
            outputfile=str(out),
            extra_args=["--standalone"],
        )
    except Exception as exc:
        raise ConversionError(f"Failed to convert DOCX to PDF: {path}") from exc

    if not out.exists():
        raise ConversionError(f"PDF output not created: {out}")

    return out


def convert_xlsx_to_pdf(path: Path) -> Path:
    out = path.with_suffix(".pdf")

    try:
        result = subprocess.run(
            [
                "soffice",
                "--headless",
                "--convert-to",
                "pdf",
                "--outdir",
                str(out),
                str(path),
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
            text=True,
        )
    except Exception as exc:
        raise ConversionError(
            f"Failed to launch soffice for XLSX conversion: {path}"
        ) from exc

    if result.returncode != 0:
        raise ConversionError(
            f"LibreOffice conversion failed for {path}.\n"
            f"stdout: {result.stdout}\n"
            f"stderr: {result.stderr}"
        )

    if not out.exists():
        raise ConversionError(f"PDF output not created: {out}")
    return out


def convert_to_pdf(path: Path) -> Path:
    suffix = path.suffix.lower()
    if suffix == ".xlsx":
        return convert_xlsx_to_pdf(path)
    if suffix == ".docx":
        return convert_docx_to_pdf(path)
    raise ConversionError(f"Unsupported file extension for PDF conversion: {path}")


def extract_comments(code: str) -> str:
    """Extract # comments and docstrings from Python code."""
    import ast

    comments: list[str] = []

    # Extract # comments using the tokenizer
    tok = tokenize.generate_tokens(StringIO(code).readline)
    for ttype, tstring, *_ in tok:
        if ttype == tokenize.COMMENT:
            comments.append(tstring.lstrip("#").strip())

    # Extract docstrings using the AST
    try:
        tree = ast.parse(code)
    except SyntaxError:
        tree = None

    if tree:
        for node in ast.walk(tree):
            if isinstance(
                node, (ast.Module, ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)
            ):
                doc = ast.get_docstring(node)
                if doc:
                    comments.append(doc)

    return "\n".join(comments)

