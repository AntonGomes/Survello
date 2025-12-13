"""
Smoke test: fetch a file from S3 and upload it directly to OpenAI without using temp files.

Env vars required:
- OPENAI_API_KEY
- S3_BUCKET_NAME
- S3_TEST_KEY (key of an existing object to upload)
- Optional: S3_REGION, S3_ENDPOINT_URL, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
"""

from __future__ import annotations

import io
import os
import sys
from pathlib import Path

import boto3
from botocore.config import Config
from dotenv import load_dotenv
from openai import OpenAI


def upload_document_from_s3(
    bucket: str,
    key: str,
    *,
    region: str | None,
    access_key: str | None,
    secret_key: str | None,
    endpoint_url: str | None,
) -> str:
    """Download an object from S3 into memory and upload it to OpenAI."""
    s3 = boto3.client(
        "s3",
        region_name=region,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        endpoint_url=endpoint_url,
        config=Config(signature_version="s3v4"),
    )

    obj = s3.get_object(Bucket=bucket, Key=key)
    data: bytes = obj["Body"].read()

    file_obj = io.BytesIO(data)
    file_obj.name = Path(key).name  # hint for the OpenAI SDK

    client = OpenAI()
    result = client.files.create(file=file_obj, purpose="user_data")
    return result.id


def main() -> int:
    load_dotenv()

    bucket = os.environ.get("S3_BUCKET_NAME")
    key = "uploads/2e44f8bb-bdbe-494f-aea8-9e99e56a55b0/a9755546-1af3-419c-92bf-1d6f358fea98-example_final_dilaps.xlsx"
    region = (
        os.environ.get("S3_REGION")
        or os.environ.get("AWS_REGION")
        or os.environ.get("AWS_DEFAULT_REGION")
    )
    access_key = os.environ.get("S3_ACCESS_KEY") or os.environ.get("AWS_ACCESS_KEY_ID")
    secret_key = os.environ.get("S3_SECRET_KEY") or os.environ.get(
        "AWS_SECRET_ACCESS_KEY"
    )
    endpoint_url = os.environ.get("S3_ENDPOINT_URL")

    if not bucket or not key:
        print("Missing S3_BUCKET_NAME or S3_TEST_KEY", file=sys.stderr)
        return 1

    try:
        file_id = upload_document_from_s3(
            bucket,
            key,
            region=region,
            access_key=access_key,
            secret_key=secret_key,
            endpoint_url=endpoint_url,
        )
    except Exception as exc:
        print(f"Upload failed: {exc}", file=sys.stderr)
        return 1

    print(f"Upload succeeded; OpenAI file_id={file_id}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
