import pytest


def pytest_addoption(parser):
    parser.addoption(
        "--save-output",
        action="store_true",
        default=False,
        help="Save generated files to tests/output for inspection",
    )
    parser.addoption(
        "--file-type",
        action="store",
        default="docx",
        help="Specify the file type for document generation tests (docx or xlsx)",
    )
