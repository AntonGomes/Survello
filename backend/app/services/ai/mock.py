from __future__ import annotations

import random

from app.core.logging import logger

from .provider import (
    AnalysisItem,
    EmbeddingProvider,
    SectionAnalysis,
    VisionProvider,
)

MOCK_ITEMS = [
    AnalysisItem(
        lease_clause="Three",
        want_of_repair="Ceiling plaster is cracked and soiled.",
        remedy="Hack off damaged plaster, replaster and redecorate.",
        unit="m\u00b2",
        quantity=12.0,
        rate=25.0,
        cost=300.0,
    ),
    AnalysisItem(
        lease_clause="Four",
        want_of_repair="Walls are soiled and due for redecoration.",
        remedy="Clean down and redecorate with 2 coats of emulsion.",
        unit="m\u00b2",
        quantity=30.0,
        rate=9.0,
        cost=270.0,
    ),
    AnalysisItem(
        lease_clause="Three",
        want_of_repair="Carpet is worn and stained.",
        remedy="Remove carpet and replace with new.",
        unit="m\u00b2",
        quantity=15.0,
        rate=48.0,
        cost=720.0,
    ),
]

MOCK_SECTION_NAMES = [
    "Kitchen",
    "Living Room",
    "Bedroom 1",
    "Bathroom",
    "Hallway",
    "Front Elevation",
    "Rear Elevation",
    "Roof",
]

EMBEDDING_DIM = 256


class MockVisionProvider(VisionProvider):
    def analyze_section(
        self,
        image_urls: list[str],
        system_prompt: str,
        context: str,
    ) -> SectionAnalysis:
        logger.info(f"MOCK: analyzing {len(image_urls)} images")
        selected = random.sample(MOCK_ITEMS, k=min(len(MOCK_ITEMS), 2))
        return SectionAnalysis(
            items=selected,
            memory_update="Mock section analyzed.",
        )

    def name_sections(
        self,
        representative_image_urls: list[str],
    ) -> list[str]:
        count = len(representative_image_urls)
        logger.info(f"MOCK: naming {count} sections")
        return MOCK_SECTION_NAMES[:count]


class MockEmbeddingProvider(EmbeddingProvider):
    def embed_images(
        self,
        image_data_list: list[bytes],
    ) -> list[list[float]]:
        logger.info(f"MOCK: embedding {len(image_data_list)} images")
        return [
            [random.gauss(0, 1) for _ in range(EMBEDDING_DIM)]
            for _ in image_data_list
        ]
