from __future__ import annotations

from typing import Literal

from app.core.s3 import S3Client


class StorageService:
    """Business logic for file storage, wrapping the raw S3Client."""

    def __init__(self, s3_client: S3Client) -> None:
        self.s3 = s3_client

    def get_file_data(self, storage_key: str) -> bytes:
        obj = self.s3.client.get_object(Bucket=self.s3.bucket_name, Key=storage_key)
        return obj["Body"].read()  # ty: ignore[no-any-return]

    def upload_file(self, storage_key: str, data: bytes) -> None:
        self.s3.client.put_object(
            Bucket=self.s3.bucket_name, Key=storage_key, Body=data
        )

    def check_file_exists(self, storage_key: str) -> bool:
        import logging

        logger = logging.getLogger(__name__)
        try:
            bucket = self.s3.bucket_name
            logger.info(f"Checking if file exists: bucket={bucket}, key={storage_key}")
            response = self.s3.client.head_object(Bucket=bucket, Key=storage_key)
            etag = response.get("ETag")
            size = response.get("ContentLength")
            logger.info(f"File exists! ETag: {etag}, Size: {size}")
            return True
        except Exception as e:
            logger.warning(
                f"File check failed for {storage_key}: {type(e).__name__}: {e}"
            )
            return False

    def generate_presigned_url(
        self,
        operation: Literal["put_object", "get_object"],
        storage_key: str,
        mime_type: str,
        file_name: str,
        inline: bool = False,
    ) -> str:
        expiration = 3600
        params: dict[str, object] = {
            "Bucket": self.s3.bucket_name,
            "Key": storage_key,
        }

        if operation == "put_object":
            if mime_type:
                params["ContentType"] = mime_type
            if inline:
                params["ContentDisposition"] = f'inline; filename="{file_name}"'

        elif operation == "get_object":
            if mime_type:
                params["ResponseContentType"] = mime_type

            disposition = "inline" if inline else "attachment"
            params["ResponseContentDisposition"] = (
                f'{disposition}; filename="{file_name}"'
            )

        return self.s3.client.generate_presigned_url(
            ClientMethod=operation,
            Params=params,
            ExpiresIn=expiration,
        )
