# backend/app/services/storage.py
from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Protocol

from app.core.settings import Settings


class StorageBackend(Protocol):
    """Storage interface for file operations."""
    
    def get_presigned_upload_url(
        self, 
        storage_key: str, 
        content_type: str,
        expires_in: int = 3600
    ) -> str:
        """Return presigned URL for uploading a file."""
        ...
    
    def get_presigned_download_url(
        self, 
        storage_key: str,
        expires_in: int = 3600
    ) -> str:
        """Return presigned URL for downloading a file."""
        ...
    
    def upload_file(self, file_path: Path, storage_key: str) -> None:
        """Upload a file from local path to storage."""
        ...
    
    def download_file(self, storage_key: str, local_path: Path) -> None:
        """Download a file from storage to local path."""
        ...


class LocalStorageBackend:
    """Local file storage (MVP - no S3 needed)."""
    
    def __init__(self, storage_root: Path, base_url: str):
        self.storage_root = storage_root
        self.storage_root.mkdir(parents=True, exist_ok=True)
        self.base_url = base_url
    
    def get_presigned_upload_url(
        self, 
        storage_key: str, 
        content_type: str,
        expires_in: int = 3600
    ) -> str:
        """Return internal upload endpoint URL."""
        return f"{self.base_url}/api/storage/upload?key={storage_key}"
    
    def get_presigned_download_url(
        self, 
        storage_key: str,
        expires_in: int = 3600
    ) -> str:
        """Return file download URL."""
        return f"{self.base_url}/api/storage/download?key={storage_key}"
    
    def upload_file(self, file_path: Path, storage_key: str) -> None:
        """Copy file to storage location."""
        target = self.storage_root / storage_key
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(file_path.read_bytes())
    
    def download_file(self, storage_key: str, local_path: Path) -> None:
        """Copy file from storage to local path."""
        source = self.storage_root / storage_key
        local_path.parent.mkdir(parents=True, exist_ok=True)
        local_path.write_bytes(source.read_bytes())
    
    def get_file_path(self, storage_key: str) -> Path:
        """Get local file path for a storage key."""
        return self.storage_root / storage_key


class S3StorageBackend:
    """S3 storage using boto3 (for later)."""
    
    def __init__(
        self,
        bucket_name: str,
        region: str = "us-east-1",
        endpoint_url: str | None = None,
        access_key: str | None = None,
        secret_key: str | None = None,
    ):
        import boto3
        session = boto3.session.Session(
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
        )
        self.s3_client = session.client(
            "s3", region_name=region, endpoint_url=endpoint_url
        )
        self.bucket_name = bucket_name
    
    def get_presigned_upload_url(
        self, 
        storage_key: str, 
        content_type: str,
        expires_in: int = 3600
    ) -> str:
        return self.s3_client.generate_presigned_url(
            "put_object",
            Params={"Bucket": self.bucket_name, "Key": storage_key, "ContentType": content_type},
            ExpiresIn=expires_in,
        )
    
    def get_presigned_download_url(
        self, 
        storage_key: str,
        expires_in: int = 3600
    ) -> str:
        return self.s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket_name, "Key": storage_key},
            ExpiresIn=expires_in,
        )
    
    def upload_file(self, file_path: Path, storage_key: str) -> None:
        self.s3_client.upload_file(str(file_path), self.bucket_name, storage_key)
    
    def download_file(self, storage_key: str, local_path: Path) -> None:
        local_path.parent.mkdir(parents=True, exist_ok=True)
        self.s3_client.download_file(self.bucket_name, storage_key, str(local_path))


def get_storage_backend(settings: Settings) -> StorageBackend:
    """Factory to get storage backend based on settings."""
    if settings.storage_backend.lower() == "s3":
        return S3StorageBackend(
            bucket_name=settings.s3_bucket_name or "",
            endpoint_url=settings.s3_endpoint_url,
            access_key=settings.s3_access_key,
            secret_key=settings.s3_secret_key,
        )
    return LocalStorageBackend(
        storage_root=settings.storage_root, base_url=settings.storage_base_url
    )
