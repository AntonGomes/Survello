import pytest


def pytest_addoption(parser):
    parser.addoption(
        "--save-output",
        action="store_true",
        default=False,
        help="Save generated files to tests/output for inspection",
    )
