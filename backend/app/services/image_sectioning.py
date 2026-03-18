from __future__ import annotations

from sqlmodel import Session, select

from app.core.logging import logger
from app.models.embedding_model import ImageEmbedding
from app.models.file_model import File
from app.services.ai.provider import EmbeddingProvider, VisionProvider
from app.services.storage import StorageService
from app.utils.exif import extract_timestamp
from app.utils.similarity import cosine_similarity

SIMILARITY_THRESHOLD = 0.75
IMAGE_MIME_PREFIXES = ("image/jpeg", "image/png", "image/webp")


def is_image_file(f: File) -> bool:
    return any(f.mime_type.startswith(p) for p in IMAGE_MIME_PREFIXES)


def _get_files_needing_embedding(
    files: list[File],
    db: Session,
) -> tuple[list[int], list[File]]:
    ids_to_embed: list[int] = []
    files_to_embed: list[File] = []
    for f in files:
        assert f.id is not None
        existing = db.exec(
            select(ImageEmbedding).where(ImageEmbedding.file_id == f.id)
        ).first()
        if not existing:
            ids_to_embed.append(f.id)
            files_to_embed.append(f)
    return ids_to_embed, files_to_embed


def _store_embeddings(
    file_ids: list[int],
    vectors: list[list[float]],
    db: Session,
) -> None:
    for file_id, vector in zip(file_ids, vectors, strict=True):
        emb = ImageEmbedding(
            file_id=file_id,
            embedding=vector,
            model_name="gemini-embedding",
        )
        db.add(emb)
    db.commit()


def compute_embeddings(
    files: list[File],
    storage: StorageService,
    embedding_provider: EmbeddingProvider,
    db: Session,
) -> list[ImageEmbedding]:
    ids_to_embed, files_to_embed = _get_files_needing_embedding(files, db)

    if files_to_embed:
        logger.info(f"Computing embeddings for {len(files_to_embed)} images")
        data_list = [storage.get_file_data(f.storage_key) for f in files_to_embed]
        vectors = embedding_provider.embed_images(data_list)
        _store_embeddings(ids_to_embed, vectors, db)

    all_file_ids = [f.id for f in files]
    return list(
        db.exec(
            select(ImageEmbedding).where(
                ImageEmbedding.file_id.in_(all_file_ids)
            )
        ).all()
    )


def _order_by_timestamp(
    files: list[File],
    storage: StorageService,
) -> list[File]:
    timestamped: list[tuple[File, float]] = []
    untimed: list[tuple[File, int]] = []

    for idx, f in enumerate(files):
        data = storage.get_file_data(f.storage_key)
        ts = extract_timestamp(data)
        if ts:
            timestamped.append((f, ts.timestamp()))
        else:
            untimed.append((f, idx))

    if len(timestamped) > len(untimed):
        timestamped.sort(key=lambda x: x[1])
        return [f for f, _ in timestamped] + [f for f, _ in untimed]

    return files


def _should_break_section(
    prev_emb: list[float],
    curr_emb: list[float],
) -> bool:
    if not prev_emb or not curr_emb:
        return False
    return cosine_similarity(prev_emb, curr_emb) < SIMILARITY_THRESHOLD


def section_images(
    files: list[File],
    embeddings: list[ImageEmbedding],
    storage: StorageService,
) -> list[list[File]]:
    if not files:
        return []

    ordered = _order_by_timestamp(files, storage)
    emb_map: dict[int, list[float]] = {
        e.file_id: e.embedding for e in embeddings
    }

    sections: list[list[File]] = [[ordered[0]]]

    for i in range(1, len(ordered)):
        prev_emb = emb_map.get(ordered[i - 1].id or 0, [])
        curr_emb = emb_map.get(ordered[i].id or 0, [])

        if _should_break_section(prev_emb, curr_emb):
            sections.append([])
        sections[-1].append(ordered[i])

    logger.info(
        f"Sectioned {len(ordered)} images into {len(sections)} groups"
    )
    return sections


def name_sections(
    sections: list[list[File]],
    vision_provider: VisionProvider,
    storage: StorageService,
) -> list[str]:
    representative_urls: list[str] = []
    for section in sections:
        mid = len(section) // 2
        f = section[mid]
        url = storage.generate_presigned_url(
            "get_object", f.storage_key, f.mime_type, f.file_name
        )
        representative_urls.append(url)

    return vision_provider.name_sections(representative_urls)
