from __future__ import annotations

import json

from google import genai
from google.genai import types

from app.core.logging import logger

from .provider import (
    AnalysisItem,
    EmbeddingProvider,
    SectionAnalysis,
    VisionProvider,
)

VISION_MODEL = "gemini-2.5-flash"
EMBEDDING_MODEL = "gemini-embedding-2-preview"
EMBEDDING_DIMENSIONS = 768
MAX_IMAGES_PER_EMBED = 6
SECTION_NAMING_PROMPT = (
    "You are a building surveyor. For each image, provide a short "
    "name for the area shown (e.g. 'Kitchen', 'Front Elevation', "
    "'Roof', 'Bathroom', 'Office 3'). Return a JSON array of "
    "strings, one per image, in the same order provided."
)


def _image_parts(image_data_list: list[bytes]) -> list[types.Part]:
    return [
        types.Part.from_bytes(data=img, mime_type="image/jpeg")
        for img in image_data_list
    ]


class GeminiVisionProvider(VisionProvider):
    def __init__(self, api_key: str) -> None:
        self.client = genai.Client(api_key=api_key)

    def analyze_section(
        self,
        image_data_list: list[bytes],
        system_prompt: str,
        context: str,
    ) -> SectionAnalysis:
        logger.info(
            f"Gemini: analyzing {len(image_data_list)} images"
        )

        contents: list = _image_parts(image_data_list)
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
        items = [
            AnalysisItem(**item) for item in raw.get("items", [])
        ]
        memory = raw.get("memory_update", "")
        return SectionAnalysis(items=items, memory_update=memory)

    def name_sections(
        self,
        representative_images: list[bytes],
    ) -> list[str]:
        logger.info(
            f"Gemini: naming {len(representative_images)} sections"
        )

        response = self.client.models.generate_content(
            model=VISION_MODEL,
            contents=_image_parts(representative_images),
            config=types.GenerateContentConfig(
                system_instruction=SECTION_NAMING_PROMPT,
                response_mime_type="application/json",
                temperature=0.1,
            ),
        )

        return json.loads(response.text)


def _embed_batch(
    client: genai.Client,
    batch: list[bytes],
) -> list[list[float]]:
    contents = [
        types.Content(
            parts=[
                types.Part.from_bytes(
                    data=img, mime_type="image/jpeg"
                )
            ]
        )
        for img in batch
    ]
    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=contents,
        config=types.EmbedContentConfig(
            output_dimensionality=EMBEDDING_DIMENSIONS
        ),
    )
    return [e.values for e in result.embeddings]


class GeminiEmbeddingProvider(EmbeddingProvider):
    def __init__(self, api_key: str) -> None:
        self.client = genai.Client(api_key=api_key)

    def embed_images(
        self,
        image_data_list: list[bytes],
    ) -> list[list[float]]:
        logger.info(
            f"Gemini: embedding {len(image_data_list)} images"
        )

        embeddings: list[list[float]] = []
        for i in range(0, len(image_data_list), MAX_IMAGES_PER_EMBED):
            batch = image_data_list[i : i + MAX_IMAGES_PER_EMBED]
            embeddings.extend(_embed_batch(self.client, batch))

        return embeddings
