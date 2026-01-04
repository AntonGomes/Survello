from __future__ import annotations

import io
from typing import Generator, Literal, Any

from openai import OpenAI

from app.schemas.common_schemas import LLMClientContainerBundle, UploadPayloadItem
from app.schemas.file_schemas import FileRead
from app.utils.document_handler import to_file_obj


class UploadError(Exception):
    """Raised when uploading or attaching files fails."""


class OpenAIService:
    """Wrapper around OpenAI APIs for uploading and streaming."""

    def __init__(self, client: OpenAI, api_key: str) -> None:
        self.client = client
        self.api_key = api_key
        self._http = client._client

    def _auth_headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.api_key}"}

    # ---- Internal Helpers -------------------------------------------------

    def _upload_fileobj(
        self, file_obj: io.BytesIO, purpose: Literal["user_data", "vision"]
    ) -> str:
        result = self.client.files.create(file=file_obj, purpose=purpose)
        return result.id

    def _attach_file_to_container(self, container_id: str, file_id: str) -> str:
        """Attaches a file to a container using the internal httpx client."""
        url = f"/containers/{container_id}/files"
        response = self._http.post(
            url,
            json={"file_id": file_id},
            headers=self._auth_headers(),
        )
        if response.is_error:
            raise UploadError(
                f"Failed to attach {file_id} to container {container_id}: "
                f"status={response.status_code} body={response.text}"
            )
        return response.json()["id"]

    # ---- Public API -------------------------------------------------------

    def upload_template(
        self,
        run_id: str,
        template_with_bytes: FileRead,
    ) -> LLMClientContainerBundle:
        """Uploads all files in a bundle and creates a container."""

        # 1. Upload Template
        template_id = self._upload_fileobj(
            to_file_obj(template_with_bytes), purpose="user_data"
        )

        # 2. Create Container
        container = self.client.containers.create(name=run_id)

        # 3. Attach Template
        template_container_file_id = self._attach_file_to_container(
            container.id, template_id
        )

        return LLMClientContainerBundle(
            container_id=container.id,
            template_container_file_id=template_container_file_id,
        )

    def stream_model_response(
        self,
        container_bundle: LLMClientContainerBundle,
        payload: list[UploadPayloadItem],
        system_prompt: str,
        user_input: str,
        model_name: str = "gpt-5-2025-08-07",
    ) -> Generator[Any, None, None]:
        """Yields raw chunks from the OpenAI stream."""
        return self.client.responses.create(
            model=model_name,
            instructions=system_prompt,
            input=[
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": user_input},
                        *[item.model_dump() for item in payload],
                    ],
                }
            ],
            tools=[
                {"type": "code_interpreter", "container": container_bundle.container_id}
            ],
            tool_choice="required",
            stream=True,
        )

    def fetch_generated_file(self, container_id: str, container_file_id: str) -> bytes:
        """Fetches the final PDF/Doc content from the container."""
        url = f"/containers/{container_id}/files/{container_file_id}/content"
        response = self._http.get(url, headers=self._auth_headers())

        if response.is_error:
            raise UploadError(
                f"Failed to fetch file from Container: status={response.status_code} body={response.text}"
            )
        return response.content
