"""LLM service abstraction for document generation."""

from __future__ import annotations

import io
import tokenize
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Iterator

from openai import OpenAI

from app.core.logging import logger


@dataclass
class LLMFile:
    """File reference for LLM input."""

    url: str
    name: str


@dataclass
class LLMContainer:
    """LLM provider's container/session references."""

    file_id: str
    container_id: str
    container_file_id: str


class BaseLLMService(ABC):
    @abstractmethod
    def upload_template(self, data: bytes, name: str, run_id: str) -> LLMContainer:
        raise NotImplementedError

    @abstractmethod
    def generate(
        self, container: LLMContainer, files: list[LLMFile], system: str, user: str
    ) -> Iterator[str]:
        raise NotImplementedError

    @abstractmethod
    def download(self, container: LLMContainer) -> bytes:
        raise NotImplementedError

    @abstractmethod
    def cleanup(self, container: LLMContainer) -> None:
        raise NotImplementedError


class MockLLMService(BaseLLMService):
    """Mock implementation for local dev/testing without costs."""

    def upload_template(self, data: bytes, name: str, run_id: str) -> LLMContainer:
        logger.info(f"MOCK: Uploaded template {name}")
        return LLMContainer("mock_file_id", "mock_container_id", "mock_cf_id")

    def generate(
        self, container: LLMContainer, files: list[LLMFile], system: str, user: str
    ) -> Iterator[str]:
        logger.info("MOCK: Generating responses...")
        actions = ["Analyzing document...", "Extracting tables...", "Finalizing PDF..."]
        for action in actions:
            yield action

    def download(self, container: LLMContainer) -> bytes:
        logger.info("MOCK: Downloading content")
        return b"%PDF-1.4 Mock PDF Content"

    def cleanup(self, container: LLMContainer) -> None:
        logger.info(f"MOCK: Cleanup container {container.container_id}")


class OpenAIService(BaseLLMService):
    """OpenAI Responses API with Code Interpreter."""

    MODEL = "gpt-5.2-2025-12-11"

    def __init__(self, client: OpenAI) -> None:
        self.client = client
        self._http = client._client

    def _headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.client.api_key}"}

    def upload_template(self, data: bytes, name: str, run_id: str) -> LLMContainer:
        logger.info(f"Uploading template: {name}")

        bio = io.BytesIO(data)
        bio.name = name
        file_id = self.client.files.create(file=bio, purpose="user_data").id

        container = self.client.containers.create(name=f"survello-{run_id}")

        resp = self._http.post(
            f"/containers/{container.id}/files",
            json={"file_id": file_id},
            headers=self._headers(),
        )
        resp.raise_for_status()

        return LLMContainer(file_id, container.id, resp.json()["id"])

    def generate(
        self, container: LLMContainer, files: list[LLMFile], system: str, user: str
    ) -> Iterator[str]:
        logger.info(f"Starting generation: {len(files)} context files")

        content = [{"type": "input_text", "text": user}]
        content += [{"type": "input_file", "file_url": f.url} for f in files]

        stream = self.client.responses.create(
            model=self.MODEL,
            instructions=system,
            input=[{"role": "user", "content": content}],  # pyright: ignore[reportArgumentType]
            tools=[{"type": "code_interpreter", "container": container.container_id}],
            tool_choice="required",
            stream=True,
        )

        for chunk in stream:  # pyright: ignore[reportUnknownVariableType]
            chunk_any: Any = chunk
            event = getattr(chunk_any, "type", "")

            if event == "response.output_text.done":
                yield str(getattr(chunk_any, "text", ""))

            elif event == "response.code_interpreter_call_code.done":
                for comment in self._extract_comments(
                    str(getattr(chunk_any, "code", ""))
                ):
                    yield comment

            elif event == "error":
                raise RuntimeError(str(getattr(chunk_any, "error", "LLM error")))

        logger.info("Generation complete")

    def download(self, container: LLMContainer) -> bytes:
        logger.info("Downloading generated file")
        resp = self._http.get(
            f"/containers/{container.container_id}/files/{container.container_file_id}/content",
            headers=self._headers(),
        )
        resp.raise_for_status()
        return resp.content

    def cleanup(self, container: LLMContainer) -> None:
        try:
            self._http.delete(
                f"/containers/{container.container_id}", headers=self._headers()
            )
            self.client.files.delete(container.file_id)
        except Exception as e:
            logger.warning(f"Cleanup failed: {e}")

    @staticmethod
    def _extract_comments(code: str) -> list[str]:
        """Extract # comments from Python code."""
        try:
            return [
                tok.lstrip("#").strip()
                for typ, tok, *_ in tokenize.generate_tokens(io.StringIO(code).readline)
                if typ == tokenize.COMMENT and tok.lstrip("#").strip()
            ]
        except Exception:
            return []
