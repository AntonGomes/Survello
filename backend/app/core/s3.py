# app/core/s3.py

import boto3
from botocore.config import Config


class S3Client:
    """S3 storage using boto3."""

    def __init__(
        self,
        bucket_name: str,
        region: str = "eu-north-1",
        endpoint_url: str | None = None,
        access_key: str | None = None,
        secret_key: str | None = None,
    ):
        # Configure timeouts to prevent hanging indefinitely
        config = Config(connect_timeout=5, read_timeout=60, retries={"max_attempts": 2})

        # Only use endpoint_url for non-AWS S3-compatible services (MinIO, LocalStack, etc.)
        # For standard AWS S3, endpoint_url should be None to use default virtual-hosted-style
        # Check if endpoint_url looks like standard AWS S3 and skip it
        use_endpoint = endpoint_url
        if endpoint_url and "s3.amazonaws.com" in endpoint_url:
            # Standard AWS S3 - don't override endpoint, let boto3 handle it
            use_endpoint = None

        # If keys are provided (Local Dev), use them.
        # If not (App Runner with IAM Role), pass None so boto3 uses the role.
        if access_key and secret_key:
            session = boto3.session.Session(
                aws_access_key_id=access_key,
                aws_secret_access_key=secret_key,
                region_name=region,
            )
            self.client = session.client(  # ty: ignore[assignment]
                "s3", region_name=region, endpoint_url=use_endpoint, config=config
            )
        else:
            # IAM Role authentication (App Runner / EC2)
            self.client = boto3.client(  # ty: ignore[assignment]
                "s3", region_name=region, endpoint_url=use_endpoint, config=config
            )

        self.bucket_name = bucket_name
