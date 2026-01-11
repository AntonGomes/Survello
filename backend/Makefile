.PHONY: ci lint fmt fmt-check type test

lint:
	uv run ruff check app

fmt:
	uv run ruff format app

fmt-check:
	uv run ruff format --check app

test:
	uv run pytest

ci: lint fmt-check test
