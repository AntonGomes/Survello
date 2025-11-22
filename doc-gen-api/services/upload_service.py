from pathlib import Path
from core.logger import logger
from core.config import client


class UploadService:
    @staticmethod
    def upload_image(path: Path) -> str:
        logger.debug(f"Uploading image: {path}")
        with open(path, "rb") as f:
            result = client.files.create(file=f, purpose="vision")
        logger.debug(f"Successful image upload {path}: file_id {result.id}")
        return result.id

    @staticmethod
    def upload_document(path: Path) -> str:
        logger.debug(f"Uploading doc: {path}")
        with open(path, "rb") as f:
            result = client.files.create(file=f, purpose="user_data")
        logger.debug(f"Successful doc upload {path}: file_id {result.id}")
        return result.id
