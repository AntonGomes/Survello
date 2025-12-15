from __future__ import annotations

import io
import time
from typing import Callable, Generator, Literal, Optional, Any

from openai import OpenAI

from app.core.logging import logger
from app.models.models import ClientContainerBundle, UploadPayloadItem
from app.utils.document_handler import PreparedBundle, to_file_obj


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

    def upload_bundle(
        self,
        job_id: str,
        bundle: PreparedBundle,
        on_progress: Optional[Callable[[int, int], None]] = None,
    ) -> ClientContainerBundle:
        """Uploads all files in a bundle and creates a container."""
        start_time = time.time()
        logger.info(f"Starting bundle upload for job_id={job_id}")

        # Calculate total size for progress tracking
        total_bytes = len(bundle.template.data)
        total_bytes += sum(len(p.data) for p in bundle.images)
        total_bytes += sum(len(p.data) for p in bundle.documents)
        uploaded = 0

        def bump(delta: int) -> None:
            nonlocal uploaded
            uploaded += delta
            if on_progress and total_bytes:
                on_progress(uploaded, total_bytes)

        # 1. Upload Template
        template_id = self._upload_fileobj(
            to_file_obj(bundle.template), purpose="user_data"
        )
        bump(len(bundle.template.data))

        # 2. Create Container
        container = self.client.containers.create(name=job_id)

        # 3. Attach Template
        template_container_file_id = self._attach_file_to_container(
            container.id, template_id
        )

        # 4. Upload & Collect IDs for Images/Docs
        image_ids = []
        for img in bundle.images:
            image_ids.append(self._upload_fileobj(to_file_obj(img), purpose="vision"))
            bump(len(img.data))

        document_ids = []
        for doc in bundle.documents:
            document_ids.append(
                self._upload_fileobj(to_file_obj(doc), purpose="user_data")
            )
            bump(len(doc.data))

        # 5. Construct Payload
        payload: list[UploadPayloadItem] = [
            UploadPayloadItem(type="input_image", file_id=fid) for fid in image_ids
        ] + [UploadPayloadItem(type="input_file", file_id=fid) for fid in document_ids]

        duration = time.time() - start_time
        logger.info(f"Bundle upload finished for job_id={job_id}. Duration: {duration:.2f}s")

        return ClientContainerBundle(
            container_id=container.id,
            template_container_file_id=template_container_file_id,
            payload=payload,
        )

    def stream_model_response(
        self,
        container_bundle: ClientContainerBundle,
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
                        *[item.model_dump() for item in container_bundle.payload],
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
