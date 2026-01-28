#!/usr/bin/env python
"""Debug script to test S3 connectivity and presigned URL behavior."""

from app.core.settings import get_settings
import boto3

settings = get_settings()

# Create session
session = boto3.session.Session(
    aws_access_key_id=settings.aws_access_key,
    aws_secret_access_key=settings.aws_secret_key,
    region_name=settings.aws_default_region or "eu-west-2",
)

# Client WITHOUT endpoint_url (standard AWS behavior)
default_client = session.client("s3", region_name=settings.aws_default_region)
default_url = default_client.generate_presigned_url(
    "put_object",
    Params={
        "Bucket": settings.s3_bucket_name,
        "Key": "1/1/test.txt",
        "ContentType": "text/plain",
    },
    ExpiresIn=3600,
)
print(f"Default (no endpoint_url): {default_url.split('?')[0]}")

# Client WITH endpoint_url
endpoint_client = session.client(
    "s3", region_name=settings.aws_default_region, endpoint_url=settings.s3_endpoint_url
)
endpoint_url = endpoint_client.generate_presigned_url(
    "put_object",
    Params={
        "Bucket": settings.s3_bucket_name,
        "Key": "1/1/test.txt",
        "ContentType": "text/plain",
    },
    ExpiresIn=3600,
)
print(f"With endpoint_url: {endpoint_url.split('?')[0]}")

# The key that was uploaded
test_key = "1/1/480b25ba-2376-42c2-b406-25398cc7c573-example_template.xlsx"

print(f"\nChecking for file: {test_key}")

# Try head_object with default client
print("\nTrying head_object with DEFAULT client...")
try:
    default_client.head_object(Bucket=settings.s3_bucket_name, Key=test_key)
    print("  -> File EXISTS with default client!")
except Exception as e:
    print(f"  -> Error: {type(e).__name__}: {e}")

# Try head_object with endpoint client
print("\nTrying head_object with ENDPOINT client...")
try:
    endpoint_client.head_object(Bucket=settings.s3_bucket_name, Key=test_key)
    print("  -> File EXISTS with endpoint client!")
except Exception as e:
    print(f"  -> Error: {type(e).__name__}: {e}")
