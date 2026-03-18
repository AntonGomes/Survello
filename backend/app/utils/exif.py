from __future__ import annotations

import io
from datetime import datetime

from PIL import Image
from PIL.ExifTags import Base as ExifBase

from app.core.logging import logger

EXIF_DATETIME_FORMAT = "%Y:%m:%d %H:%M:%S"


def extract_timestamp(image_bytes: bytes) -> datetime | None:
    try:
        img = Image.open(io.BytesIO(image_bytes))
        exif_data = img.getexif()
        if not exif_data:
            return None

        raw = exif_data.get(ExifBase.DateTimeOriginal)
        if not raw:
            raw = exif_data.get(ExifBase.DateTime)
        if not raw:
            return None

        return datetime.strptime(str(raw), EXIF_DATETIME_FORMAT)
    except Exception as e:
        logger.debug(f"EXIF extraction failed: {e}")
        return None
