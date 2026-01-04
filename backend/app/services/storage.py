from __future__ import annotations

from typing import Literal

from app.core.s3 import S3Client
from app.schemas.file_schemas import FileStore


class StorageService:
    """Business logic for file storage, wrapping the raw S3Client."""

    def __init__(self, s3_client: S3Client) -> None:
        self.s3 = s3_client

    def get_file_with_bytes(self, file: FileStore) -> FileStore:
        obj = self.s3.client.get_object(
            Bucket=self.s3.bucket_name, Key=file.storage_key
        )
        file.data = obj["Body"].read()
        return file

    def upload_file(self, file: FileStore) -> None:
        self.s3.client.put_object(
            Bucket=self.s3.bucket_name, Key=file.storage_key, Body=file.data
        )

    def check_file_exists(self, storage_key: str) -> bool:
        try:
            self.s3.client.head_object(Bucket=self.s3.bucket_name, Key=storage_key)
            return True
        except Exception:
            return False

    def generate_presigned_url(
        self,
        operation: Literal["put_object", "get_object"],
        file: FileStore,
        expiration: int = 3600,
        inline: bool = False,
    ) -> str:
        params: dict[str, object] = {
            "Bucket": self.s3.bucket_name,
            "Key": file.storage_key,
        }

        if operation == "put_object":
            # This sets metadata on the uploaded object (good to do)
            if file.mime_type:
                params["ContentType"] = file.mime_type
            if inline:
                params["ContentDisposition"] = f'inline; filename="{file.file_name}"'

        elif operation == "get_object":
            # These override response headers when viewing/downloading
            if file.mime_type:
                params["ResponseContentType"] = file.mime_type
            if inline:
                params["ResponseContentDisposition"] = (
                    f'inline; filename="{file.file_name}"'
                )

        return self.s3.client.generate_presigned_url(
            ClientMethod=operation,
            Params=params,
            ExpiresIn=expiration,
        )
