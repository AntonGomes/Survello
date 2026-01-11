FROM python:3.11-slim

# Install system dependencies
# pandoc: for pypandoc
# libreoffice-writer/java: for docx -> pdf conversion
# fonts-liberation: standard fonts for document rendering
# curl: utility
RUN apt-get update && apt-get install -y \
    --no-install-recommends \
    libreoffice-writer \
    libreoffice-java-common \
    default-jre \
    fonts-liberation \
    libmagic1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
# Use --no-install-project to install dependencies but not the project itself
# This layer is cached until pyproject.toml or uv.lock changes
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-editable

# Copy the project into the image
COPY . .

# Sync the project
# This layer is rebuilt whenever the project source changes
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-editable

# Place the virtual environment in the PATH
ENV PATH="/app/.venv/bin:$PATH"

# Expose the port the app runs on
EXPOSE 8080

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
