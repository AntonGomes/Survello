from __future__ import annotations

import io
import json

from google import genai
from google.genai import types
from PIL import Image

from app.core.logging import logger

from .provider import (
    AnalysisItem,
    EmbeddingProvider,
    SectionAnalysis,
    VisionProvider,
)

VISION_MODEL = "gemini-2.5-flash"
EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSIONS = 256
DESCRIBE_PROMPT = (
    "Describe this image in one sentence for a building survey. "
    "Focus on the room/area type and visible condition issues."
)
SECTION_NAMING_PROMPT = (
    "You are a building surveyor. For each image, provide a short "
    "name for the area shown (e.g. 'Kitchen', 'Front Elevation', "
    "'Roof', 'Bathroom', 'Office 3'). Return a JSON array of "
    "strings, one per image, in the same order provided."
)


def _bytes_to_pil(data: bytes) -> Image.Image:
    return Image.open(io.BytesIO(data))


class GeminiVisionProvider(VisionProvider):
    def __init__(self, api_key: str) -> None:
        self.client = genai.Client(api_key=api_key)

    def analyze_section(
        self,
        image_urls: list[str],
        system_prompt: str,
        context: str,
    ) -> SectionAnalysis:
        logger.info(f"Gemini: analyzing {len(image_urls)} images")

        contents: list = []
        for url in image_urls:
            contents.append(
                types.Part.from_uri(file_uri=url, mime_type="image/jpeg")
            )
        contents.append(context)

        response = self.client.models.generate_content(
            model=VISION_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )

        raw = json.loads(response.text)
        items = [AnalysisItem(**item) for item in raw.get("items", [])]
        memory = raw.get("memory_update", "")
        return SectionAnalysis(items=items, memory_update=memory)

    def name_sections(
        self,
        representative_image_urls: list[str],
    ) -> list[str]:
        logger.info(
            f"Gemini: naming {len(representative_image_urls)} sections"
        )

        contents: list = []
        for url in representative_image_urls:
            contents.append(
                types.Part.from_uri(file_uri=url, mime_type="image/jpeg")
            )

        response = self.client.models.generate_content(
            model=VISION_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SECTION_NAMING_PROMPT,
                response_mime_type="application/json",
                temperature=0.1,
            ),
        )

        return json.loads(response.text)


class GeminiEmbeddingProvider(EmbeddingProvider):
    def __init__(self, api_key: str) -> None:
        self.client = genai.Client(api_key=api_key)

    def _describe_image(self, image_data: bytes) -> str:
        pil_img = _bytes_to_pil(image_data)
        response = self.client.models.generate_content(
            model=VISION_MODEL,
            contents=[pil_img, DESCRIBE_PROMPT],
        )
        return response.text or ""

    def embed_images(
        self,
        image_data_list: list[bytes],
    ) -> list[list[float]]:
        logger.info(f"Gemini: describing {len(image_data_list)} images")
        descriptions = [self._describe_image(d) for d in image_data_list]

        logger.info(f"Gemini: embedding {len(descriptions)} descriptions")
        response = self.client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=descriptions,
            config=types.EmbedContentConfig(
                output_dimensionality=EMBEDDING_DIMENSIONS
            ),
        )

        return [e.values for e in response.embeddings]
