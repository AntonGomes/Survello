# app/core/s3.py

import boto3


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
        # If keys are provided (Local Dev), use them.
        # If not (App Runner with IAM Role), pass None so boto3 uses the role.
        if access_key and secret_key:
            session = boto3.session.Session(
                aws_access_key_id=access_key,
                aws_secret_access_key=secret_key,
                region_name=region,
            )
            self.client = session.client(
                "s3", region_name=region, endpoint_url=endpoint_url
            )
        else:
            # IAM Role authentication (App Runner / EC2)
            self.client = boto3.client(
                "s3", region_name=region, endpoint_url=endpoint_url
            )

        self.bucket_name = bucket_name
