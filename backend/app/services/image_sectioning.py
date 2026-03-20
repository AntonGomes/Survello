from __future__ import annotations

from collections.abc import Callable

from sqlmodel import Session, select

from app.core.logging import logger
from app.models.embedding_model import ImageEmbedding
from app.models.file_model import File
from app.services.ai.provider import EmbeddingProvider, VisionProvider
from app.services.storage import StorageService
from app.utils.exif import extract_timestamp
from app.utils.similarity import centroid, cosine_similarity

SIMILARITY_THRESHOLD = 0.75
SINGLETON_MERGE_START = 0.55
SINGLETON_MERGE_STEP = 0.05
IMAGE_MIME_PREFIXES = ("image/jpeg", "image/png", "image/webp")
MAX_NAMING_BATCH = 10
NAMING_RETRIES = 2


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

    cached = len(files) - len(files_to_embed)
    if cached:
        logger.info(f"Embedding cache hit: {cached}/{len(files)} files")
    return ids_to_embed, files_to_embed


def _store_embeddings(
    file_ids: list[int],
    vectors: list[list[float]],
    db: Session,
) -> None:
    for file_id, vector in zip(file_ids, vectors, strict=True):
        existing = db.exec(
            select(ImageEmbedding).where(ImageEmbedding.file_id == file_id)
        ).first()
        if existing:
            existing.embedding = vector
        else:
            emb = ImageEmbedding(
                file_id=file_id,
                embedding=vector,
                model_name="gemini-embedding",
            )
            db.add(emb)
    db.commit()


ProgressCallback = Callable[[int, int], None]

EMBED_BATCH_SIZE = 6


def compute_embeddings(
    files: list[File],
    storage: StorageService,
    embedding_provider: EmbeddingProvider,
    db: Session,
    on_progress: ProgressCallback | None = None,
) -> list[ImageEmbedding]:
    ids_to_embed, files_to_embed = _get_files_needing_embedding(files, db)
    total = len(files)
    cached = total - len(files_to_embed)

    if on_progress and cached > 0:
        on_progress(cached, total)

    if files_to_embed:
        logger.info(f"Computing embeddings for {len(files_to_embed)} images")
        data_list = [storage.get_file_data(f.storage_key) for f in files_to_embed]

        all_vectors: list[list[float]] = []
        for i in range(0, len(data_list), EMBED_BATCH_SIZE):
            batch = data_list[i : i + EMBED_BATCH_SIZE]
            batch_vectors = embedding_provider.embed_images(batch)
            all_vectors.extend(batch_vectors)
            if on_progress:
                on_progress(cached + i + len(batch), total)

        _store_embeddings(ids_to_embed, all_vectors, db)

    all_file_ids = [f.id for f in files]
    return list(
        db.exec(
            select(ImageEmbedding).where(ImageEmbedding.file_id.in_(all_file_ids))
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


def _section_centroid(
    section: list[File],
    emb_map: dict[int, list[float]],
) -> list[float]:
    vecs = [emb_map[f.id] for f in section if f.id in emb_map]
    if not vecs:
        return []
    return centroid(vecs)


def _best_neighbor(
    idx: int,
    sections: list[list[File]],
    file_emb: list[float],
    emb_map: dict[int, list[float]],
    skip: set[int],
) -> tuple[int, float]:
    best_sim = -1.0
    best_idx = -1
    for j in (idx - 1, idx + 1):
        if j < 0 or j >= len(sections) or j in skip:
            continue
        neighbor_centroid = _section_centroid(sections[j], emb_map)
        if not neighbor_centroid:
            continue
        sim = cosine_similarity(file_emb, neighbor_centroid)
        if sim > best_sim:
            best_sim = sim
            best_idx = j
    return best_idx, best_sim


def _run_merge_pass(
    sections: list[list[File]],
    emb_map: dict[int, list[float]],
    threshold: float,
) -> list[list[File]]:
    merged_indices: set[int] = set()
    for i, section in enumerate(sections):
        if len(section) != 1 or i in merged_indices:
            continue
        file_emb = emb_map.get(section[0].id or 0, [])
        if not file_emb:
            continue
        best_idx, best_sim = _best_neighbor(
            i, sections, file_emb, emb_map, merged_indices
        )
        if best_idx >= 0 and best_sim >= threshold:
            sections[best_idx].extend(section)
            merged_indices.add(i)

    if merged_indices:
        sections = [s for i, s in enumerate(sections) if i not in merged_indices]
        logger.info(
            f"Merged {len(merged_indices)} singletons at threshold {threshold:.2f}"
        )
    return sections


def _merge_singletons(
    sections: list[list[File]],
    emb_map: dict[int, list[float]],
) -> list[list[File]]:
    if len(sections) <= 1:
        return sections

    threshold = SINGLETON_MERGE_START
    while threshold <= SIMILARITY_THRESHOLD:
        if not any(len(s) == 1 for s in sections):
            break
        sections = _run_merge_pass(sections, emb_map, threshold)
        threshold += SINGLETON_MERGE_STEP

    remaining = sum(1 for s in sections if len(s) == 1)
    if remaining:
        logger.info(f"{remaining} singletons remain after merge passes")
    return sections


def section_images(
    files: list[File],
    embeddings: list[ImageEmbedding],
    storage: StorageService,
) -> list[list[File]]:
    if not files:
        return []

    ordered = _order_by_timestamp(files, storage)
    emb_map: dict[int, list[float]] = {e.file_id: e.embedding for e in embeddings}

    sections: list[list[File]] = [[ordered[0]]]

    for i in range(1, len(ordered)):
        prev_emb = emb_map.get(ordered[i - 1].id or 0, [])
        curr_emb = emb_map.get(ordered[i].id or 0, [])

        if _should_break_section(prev_emb, curr_emb):
            sections.append([])
        sections[-1].append(ordered[i])

    pre_merge = len(sections)
    sections = _merge_singletons(sections, emb_map)

    logger.info(
        f"Sectioned {len(ordered)} images into {len(sections)} groups "
        f"(pre-merge: {pre_merge})"
    )
    return sections


def _name_batch(
    batch_images: list[bytes],
    vision_provider: VisionProvider,
) -> list[str]:
    for attempt in range(NAMING_RETRIES + 1):
        names = vision_provider.name_sections(batch_images)
        valid_names = [n for n in names if isinstance(n, str) and n.strip()]
        if len(valid_names) >= len(batch_images):
            return valid_names[: len(batch_images)]
        if attempt < NAMING_RETRIES:
            logger.warning(
                f"Naming returned {len(valid_names)}/{len(batch_images)} names, "
                f"retrying (attempt {attempt + 1})"
            )
    return names


def name_sections(
    sections: list[list[File]],
    vision_provider: VisionProvider,
    storage: StorageService,
) -> list[str]:
    representative_images: list[bytes] = []
    for section in sections:
        mid = len(section) // 2
        f = section[mid]
        representative_images.append(storage.get_file_data(f.storage_key))

    all_names: list[str] = []
    for i in range(0, len(representative_images), MAX_NAMING_BATCH):
        batch = representative_images[i : i + MAX_NAMING_BATCH]
        batch_names = _name_batch(batch, vision_provider)
        all_names.extend(batch_names)

    expected = len(sections)
    if len(all_names) < expected:
        logger.warning(
            f"LLM returned {len(all_names)} names for {expected} sections, "
            "padding with defaults"
        )
        for i in range(len(all_names), expected):
            all_names.append(f"Section {i + 1}")

    return all_names[:expected]
