from __future__ import annotations

from pathlib import Path
from typing import Literal

from app.core.s3 import S3Client


class StorageService:
    """Business logic for file storage, wrapping the raw S3Client."""

    def __init__(self, s3_client: S3Client) -> None:
        self.s3 = s3_client

    def get_file_bytes(self, key: str) -> tuple[str, bytes]:
        obj = self.s3.client.get_object(Bucket=self.s3.bucket_name, Key=key)
        data = obj["Body"].read()
        filename = Path(key).name
        return filename, data

    def upload_file(self, key: str, data: bytes) -> None:
        self.s3.client.put_object(Bucket=self.s3.bucket_name, Key=key, Body=data)

    def generate_presigned_url(
        self,
        operation: Literal["put_object", "get_object"],
        key: str,
        content_type: str | None = None,
        expiration: int = 3600,
    ) -> str:
        """Generates a presigned URL for uploading or downloading."""
        params = {
            "Bucket": self.s3.bucket_name,
            "Key": key,
        }
        if content_type:
            params["ContentType"] = content_type

        return self.s3.client.generate_presigned_url(
            ClientMethod=operation,
            Params=params,
            ExpiresIn=expiration,
        )
