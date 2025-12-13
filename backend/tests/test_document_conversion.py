import pytest
from pathlib import Path
from app.utils.document_handler import _convert_docx_bytes, _convert_xlsx_bytes

# Define paths to fixtures
FIXTURES_DIR = Path(__file__).parent / "fixtures"
OUTPUT_DIR = Path(__file__).parent / "output"


@pytest.fixture(scope="session", autouse=True)
def ensure_output_dir():
    """Ensure the output directory exists."""
    OUTPUT_DIR.mkdir(exist_ok=True)


def test_convert_docx_to_pdf(request):
    """Test converting a DOCX file to PDF using LibreOffice."""
    docx_path = FIXTURES_DIR / "example_context.docx"

    # Create a dummy docx if it doesn't exist for testing purposes
    if not docx_path.exists():
        pytest.skip(
            f"Fixture {docx_path} not found. Please add a sample.docx to backend/tests/fixtures."
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


def test_convert_xlsx_to_pdf(request):
    """Test converting an XLSX file to PDF using LibreOffice."""
    xlsx_path = FIXTURES_DIR / "example_template.xlsx"

    # Create a dummy xlsx if it doesn't exist for testing purposes
    if not xlsx_path.exists():
        pytest.skip(
            f"Fixture {xlsx_path} not found. Please add a example_template.xlsx to backend/tests/fixtures."
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
