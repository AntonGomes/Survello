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

        # If keys are provided (Local Dev), use them.
        # If not (App Runner with IAM Role), pass None so boto3 uses the role.
        if access_key and secret_key:
            session = boto3.session.Session(
                aws_access_key_id=access_key,
                aws_secret_access_key=secret_key,
                region_name=region,
            )
            self.client = session.client(
                "s3", region_name=region, endpoint_url=endpoint_url, config=config
            )
        else:
            # IAM Role authentication (App Runner / EC2)
            self.client = boto3.client(
                "s3", region_name=region, endpoint_url=endpoint_url, config=config
            )

        self.bucket_name = bucket_name
