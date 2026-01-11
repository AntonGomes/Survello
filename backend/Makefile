.PHONY: ci lint fmt fmt-check type test

lint:
	uv run ruff check app

fmt:
	uv run ruff format app

fmt-check:
	uv run ruff format --check app

type:
	uv run pyright

test:
	uv run pytest

ci: lint fmt-check type test