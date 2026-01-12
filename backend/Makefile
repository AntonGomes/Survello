.PHONY: ci lint fmt fmt-check type test

lint:
	uv run ruff check app

fmt:
	uv run ruff format app

fmt-check:
	uv run ruff format --check app

test:
	uv run pytest
run:
	uv run python -m uvicorn app.main:app --reload

ci: lint fmt-check test
