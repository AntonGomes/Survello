from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class AnalysisItem:
    lease_clause: str
    want_of_repair: str
    remedy: str
    unit: str
    quantity: float | None = None
    rate: float | None = None
    cost: float | None = None


@dataclass
class SectionAnalysis:
    items: list[AnalysisItem]
    memory_update: str


class VisionProvider(ABC):
    @abstractmethod
    def analyze_section(
        self,
        image_data_list: list[bytes],
        system_prompt: str,
        context: str,
    ) -> SectionAnalysis:
        raise NotImplementedError

    @abstractmethod
    def name_sections(
        self,
        representative_images: list[bytes],
    ) -> list[str]:
        raise NotImplementedError


class EmbeddingProvider(ABC):
    @abstractmethod
    def embed_images(
        self,
        image_data_list: list[bytes],
    ) -> list[list[float]]:
        raise NotImplementedError
