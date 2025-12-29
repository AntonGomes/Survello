import shutil
import platform

import pytest
from pathlib import Path
from app.utils.document_handler import _convert_docx_bytes, _convert_xlsx_bytes

# Define paths to fixtures
FIXTURES_DIR = Path(__file__).parent / "fixtures"
OUTPUT_DIR = Path(__file__).parent / "output"


def _libreoffice_available() -> bool:
    """Check if LibreOffice is available on this system."""
    if shutil.which("soffice"):
        return True
    # On macOS, check the standard installation path
    if platform.system() == "Darwin":
        return Path("/Applications/LibreOffice.app/Contents/MacOS/soffice").exists()
    return False


# Skip marker for tests requiring LibreOffice
requires_libreoffice = pytest.mark.skipif(
    not _libreoffice_available(),
    reason="LibreOffice (soffice) not installed",
)


@pytest.fixture(scope="session", autouse=True)
def ensure_output_dir():
    """Ensure the output directory exists."""
    OUTPUT_DIR.mkdir(exist_ok=True)


@requires_libreoffice
def test_convert_docx_to_pdf(request):
    """Test converting a DOCX file to PDF using LibreOffice."""
    docx_path = FIXTURES_DIR / "docx_inputs" / "example_template.docx"

    if not docx_path.exists():
        pytest.skip(
            f"Fixture {docx_path} not found. Please add example_template.docx to backend/tests/fixtures/docx_inputs/."
        )

    docx_data = docx_path.read_bytes()
    pdf_data = _convert_docx_bytes(docx_data)

    assert pdf_data is not None
    assert len(pdf_data) > 0
    assert pdf_data.startswith(b"%PDF")

    # Save output if flag is provided (or always for manual inspection during dev)
    if request.config.getoption("--save-output"):
        output_path = OUTPUT_DIR / "converted_sample.pdf"
        output_path.write_bytes(pdf_data)
        print(f"\nSaved converted PDF to: {output_path}")


@requires_libreoffice
def test_convert_xlsx_to_pdf(request):
    """Test converting an XLSX file to PDF using LibreOffice."""
    xlsx_path = FIXTURES_DIR / "xlsx_inputs" / "example_template.xlsx"

    if not xlsx_path.exists():
        pytest.skip(
            f"Fixture {xlsx_path} not found. Please add example_template.xlsx to backend/tests/fixtures/xlsx_inputs/."
        )

    xlsx_data = xlsx_path.read_bytes()
    pdf_data = _convert_xlsx_bytes(xlsx_data)

    assert pdf_data is not None
    assert len(pdf_data) > 0
    assert pdf_data.startswith(b"%PDF")

    # Save output if flag is provided
    if request.config.getoption("--save-output"):
        output_path = OUTPUT_DIR / "converted_sample_xlsx.pdf"
        output_path.write_bytes(pdf_data)
        print(f"\nSaved converted PDF to: {output_path}")
