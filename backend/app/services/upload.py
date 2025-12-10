from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Iterable, List, Optional
from pydantic import BaseModel

import requests
from openai import OpenAI

from app.core.logging import logger
from app.models.models import ClientContainerBundle


class UploadError(Exception):
    """Raised when uploading or attaching files fails."""

class UploadService:
    def __init__(self, client: OpenAI, api_key: str, container_prefix: str) -> None:
        self.client = client
        self.api_key = api_key
        self.container_prefix = container_prefix

    def upload_template(self, path: Path) -> str:
        logger.debug("Uploading template: %s", path)
        with open(path, "rb") as file_handle:
            result = self.client.files.create(file=file_handle, purpose="user_data")
        logger.debug("Template uploaded: %s -> %s", path, result.id)
        return result.id

    def upload_document(self, path: Path) -> str:
        logger.debug("Uploading doc: %s", path)
        with open(path, "rb") as file_handle:
            result = self.client.files.create(file=file_handle, purpose="user_data")
        logger.debug("Doc uploaded: %s -> %s", path, result.id)
        return result.id

    def upload_image(self, path: Path) -> str:
        logger.debug("Uploading image: %s", path)
        with open(path, "rb") as file_handle:
            result = self.client.files.create(file=file_handle, purpose="vision")
        logger.debug("Image uploaded: %s -> %s", path, result.id)
        return result.id

    def _attach_template_to_container(self, container_id: str, template_file_id: str) -> str:
        attach_url = f"https://api.openai.com/v1/containers/{container_id}/files"
        res = requests.post(
            attach_url,
            json={"file_id": template_file_id},
            headers={"Authorization": f"Bearer {self.api_key}"},
        )

        if not res.ok:
            raise UploadError(
                f"Failed to attach template to container: status={res.status_code} body={res.text}"
            )

        logger.info(
            "Template file attached to container %s (file_id=%s)",
            container_id,
            template_file_id,
        )
        data = res.json()
        return data["id"]

    def upload(
        self,
        job_id: str,
        template: Path,
        images: Iterable[Path],
        documents: Iterable[Path],
        on_progress: Optional[Callable[[int, int], None]] = None,
    ) -> ClientContainerBundle:
        total_bytes = template.stat().st_size
        total_bytes += sum(path.stat().st_size for path in images)
        total_bytes += sum(path.stat().st_size for path in documents)
        uploaded = 0

        def bump(delta: int) -> None:
            nonlocal uploaded
            uploaded += delta
            if on_progress and total_bytes:
                on_progress(uploaded, total_bytes)

        template_id = self.upload_template(template)
        bump(template.stat().st_size)

        container = self.client.containers.create(
            name=f"{self.container_prefix}-{job_id}"
        )

        template_container_file_id = self._attach_template_to_container(
            container.id, template_id
        )

        image_ids = []
        for img in images:
            image_ids.append(self.upload_image(img))
            bump(img.stat().st_size)

        document_ids = []
        for doc in documents:
            document_ids.append(self.upload_document(doc))
            bump(doc.stat().st_size)

        payload = [
            {"type": "input_image", "file_id": file_id} for file_id in image_ids
        ] + [{"type": "input_file", "file_id": file_id} for file_id in document_ids]

        return ClientContainerBundle(
            container_id=container.id,
            template_container_file_id=template_container_file_id,
            payload=payload,
        )
