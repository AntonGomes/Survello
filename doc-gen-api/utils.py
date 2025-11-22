from pathlib import Path
import subprocess
import pypandoc

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
DOC_EXTS = {".pdf", ".docx", ".xlsx"}


def is_image(path: Path) -> bool:
    return path.suffix.lower() in IMAGE_EXTS


def is_document(path: Path) -> bool:
    return path.suffix.lower() in DOC_EXTS


class ConversionError(Exception):
    """Raised when a file cannot be converted to PDF."""

    pass


def convert_docx_to_pdf(path: Path, output_dir: Path) -> Path:
    out = output_dir / path.with_suffix(".pdf").name

    try:
        pypandoc.convert_file(
            str(path),
            "pdf",
            outputfile=str(out),
            extra_args=["--standalone"],
        )
    except Exception as e:
        raise ConversionError(f"Failed to convert DOCX to PDF: {path}") from e

    if not out.exists():
        raise ConversionError(f"PDF output not created: {out}")

    return out


def convert_xlsx_to_pdf(path: Path, output_dir: Path) -> Path:
    out = output_dir / path.with_suffix(".pdf").name

    try:
        result = subprocess.run(
            [
                "soffice",
                "--headless",
                "--convert-to",
                "pdf",
                "--outdir",
                str(output_dir),
                str(path),
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
            text=True,
        )
    except Exception as e:
        raise ConversionError(
            f"Failed to launch soffice for XLSX conversion: {path}"
        ) from e

    if result.returncode != 0:
        raise ConversionError(
            f"LibreOffice conversion failed for {path}.\n"
            f"stdout: {result.stdout}\n"
            f"stderr: {result.stderr}"
        )

    if not out.exists():
        raise ConversionError(f"PDF output not created: {out}")
    return out


def convert_to_pdf(path: Path, output_dir: Path) -> Path:
    if path.suffix == ".xlsx":
        return convert_xlsx_to_pdf(path, output_dir)
    elif path.suffix == ".docx":
        return convert_docx_to_pdf(path, output_dir)
    else:
        raise Exception(f"ERROR: convert_to_pdf {path}")

import ast
import tokenize
from io import StringIO

def extract_comments(code: str) -> str:
    """
    Extracts all comments (both # comments and docstrings)
    from a Python code snippet and returns them as plain text.
    """
    comments = []

    # --- Extract # comments using the tokenizer ---
    tok = tokenize.generate_tokens(StringIO(code).readline)
    for ttype, tstring, *_ in tok:
        if ttype == tokenize.COMMENT:
            # Remove leading '#'
            comments.append(tstring.lstrip('#').strip())

    # --- Extract docstrings using the AST ---
    try:
        tree = ast.parse(code)
    except SyntaxError:
        tree = None

    if tree:
        for node in ast.walk(tree):
            if isinstance(node, (ast.Module, ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                doc = ast.get_docstring(node)
                if doc:
                    comments.append(doc)

    return "\n".join(comments)