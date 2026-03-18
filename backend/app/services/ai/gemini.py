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
EMBEDDING_MODEL = "gemini-embedding-exp-03-07"
SECTION_NAMING_PROMPT = (
    "You are a building surveyor. For each image, provide a short name "
    "for the area shown (e.g. 'Kitchen', 'Front Elevation', 'Roof', "
    "'Bathroom', 'Office 3'). Return a JSON array of strings, one per "
    "image, in the same order as the images provided."
)


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

        parts: list[types.Part] = []
        for url in image_urls:
            parts.append(types.Part.from_uri(file_uri=url, mime_type="image/jpeg"))
        parts.append(types.Part.from_text(text=context))

        response = self.client.models.generate_content(
            model=VISION_MODEL,
            contents=[types.Content(role="user", parts=parts)],
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
        logger.info(f"Gemini: naming {len(representative_image_urls)} sections")

        parts: list[types.Part] = []
        for url in representative_image_urls:
            parts.append(types.Part.from_uri(file_uri=url, mime_type="image/jpeg"))

        response = self.client.models.generate_content(
            model=VISION_MODEL,
            contents=[types.Content(role="user", parts=parts)],
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

    def embed_images(
        self,
        image_data_list: list[bytes],
    ) -> list[list[float]]:
        logger.info(f"Gemini: embedding {len(image_data_list)} images")

        embeddings: list[list[float]] = []
        batch_size = 5
        for i in range(0, len(image_data_list), batch_size):
            batch = image_data_list[i : i + batch_size]
            contents = [
                types.Content(
                    parts=[types.Part.from_bytes(data=img, mime_type="image/jpeg")]
                )
                for img in batch
            ]
            result = self.client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=contents,
            )
            embeddings.extend([e.values for e in result.embeddings])

        return embeddings
