from __future__ import annotations

from typing import Literal

from app.core.s3 import S3Client
from app.models.models import FileRead


class StorageService:
    """Business logic for file storage, wrapping the raw S3Client."""

    def __init__(self, s3_client: S3Client) -> None:
        self.s3 = s3_client

    def get_file_with_bytes(self, file: FileRead) -> FileRead:
        obj = self.s3.client.get_object(
            Bucket=self.s3.bucket_name, Key=file.storage_key
        )
        file.data = obj["Body"].read()
        return file

    def upload_file(self, file: FileRead) -> None:
        self.s3.client.put_object(
            Bucket=self.s3.bucket_name, Key=file.storage_key, Body=file.data
        )

    def generate_presigned_url(
        self,
        operation: Literal["put_object", "get_object"],
        key: str,
        content_type: str | None = None,
        expiration: int = 3600,
        inline: bool = False,
        filename: str | None = None,
    ) -> str:
        params: dict[str, object] = {
            "Bucket": self.s3.bucket_name,
            "Key": key,
        }

        if operation == "put_object":
            # This sets metadata on the uploaded object (good to do)
            if content_type:
                params["ContentType"] = content_type
            if inline:
                params["ContentDisposition"] = (
                    f'inline; filename="{filename or key.split("/")[-1]}"'
                )

        elif operation == "get_object":
            # These override response headers when viewing/downloading
            if content_type:
                params["ResponseContentType"] = content_type
            if inline:
                params["ResponseContentDisposition"] = (
                    f'inline; filename="{filename or key.split("/")[-1]}"'
                )

        return self.s3.client.generate_presigned_url(
            ClientMethod=operation,
            Params=params,
            ExpiresIn=expiration,
        )
