from __future__ import annotations

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
ADJACENT_MERGE_THRESHOLD = 0.88
BREAK_WINDOW_SIZE = 5
IMAGE_MIME_PREFIXES = ("image/jpeg", "image/png", "image/webp")
MAX_NAMING_BATCH = 10
NAMING_RETRIES = 2
MIN_MERGE_GROUP_SIZE = 2


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


def _window_centroid(
    section: list[File],
    emb_map: dict[int, list[float]],
) -> list[float]:
    tail = section[-BREAK_WINDOW_SIZE:]
    vecs = [emb_map[f.id] for f in tail if f.id in emb_map]
    return centroid(vecs) if vecs else []


def _should_break_section(
    section: list[File],
    curr_emb: list[float],
    emb_map: dict[int, list[float]],
) -> bool:
    if not curr_emb:
        return False
    window_c = _window_centroid(section, emb_map)
    if not window_c:
        return False
    return cosine_similarity(window_c, curr_emb) < SIMILARITY_THRESHOLD


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


def _merge_similar_adjacent(
    sections: list[list[File]],
    emb_map: dict[int, list[float]],
) -> list[list[File]]:
    if len(sections) <= 1:
        return sections

    pre_count = len(sections)
    changed = True
    while changed:
        changed = False
        merged: list[list[File]] = [sections[0]]
        for i in range(1, len(sections)):
            prev_centroid = _section_centroid(merged[-1], emb_map)
            curr_centroid = _section_centroid(sections[i], emb_map)
            if prev_centroid and curr_centroid:
                sim = cosine_similarity(prev_centroid, curr_centroid)
                if sim >= ADJACENT_MERGE_THRESHOLD:
                    merged[-1].extend(sections[i])
                    changed = True
                    continue
            merged.append(sections[i])
        sections = merged

    merged_count = pre_count - len(sections)
    if merged_count:
        logger.info(
            f"Merged {merged_count} adjacent sections "
            f"at threshold {ADJACENT_MERGE_THRESHOLD:.2f}"
        )
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
        curr_emb = emb_map.get(ordered[i].id or 0, [])

        if _should_break_section(sections[-1], curr_emb, emb_map):
            sections.append([])
        sections[-1].append(ordered[i])

    pre_merge = len(sections)
    sections = _merge_singletons(sections, emb_map)
    sections = _merge_similar_adjacent(sections, emb_map)

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


def _apply_llm_merges(
    merge_groups: list[list[int]],
    sections: list[list[File]],
    names: list[str],
) -> tuple[list[list[File]], list[str]]:
    absorbed: set[int] = set()
    for group in merge_groups:
        valid = [i for i in group if 0 <= i < len(sections) and i not in absorbed]
        if len(valid) < MIN_MERGE_GROUP_SIZE:
            continue
        target = valid[0]
        for src in valid[1:]:
            sections[target].extend(sections[src])
            absorbed.add(src)
        names[target] = names[valid[0]]

    new_sections = [s for i, s in enumerate(sections) if i not in absorbed]
    new_names = [n for i, n in enumerate(names) if i not in absorbed]
    return new_sections, new_names


LLM_MERGE_WINDOW = 15
LLM_MERGE_OVERLAP = 5
MAX_LLM_MERGE_ROUNDS = 3


def _llm_merge_pass(
    sections: list[list[File]],
    names: list[str],
    vision_provider: VisionProvider,
    storage: StorageService,
) -> tuple[list[list[File]], list[str], int]:
    total_merged = 0
    start = 0
    step = LLM_MERGE_WINDOW - LLM_MERGE_OVERLAP

    while start < len(sections):
        end = min(start + LLM_MERGE_WINDOW, len(sections))
        window_images = [
            storage.get_file_data(s[len(s) // 2].storage_key)
            for s in sections[start:end]
        ]
        window_names = names[start:end]

        merge_groups = vision_provider.suggest_merges(window_images, window_names)
        if merge_groups:
            absolute_groups = [[idx + start for idx in group] for group in merge_groups]
            pre = len(sections)
            sections, names = _apply_llm_merges(absolute_groups, sections, names)
            merged_in_window = pre - len(sections)
            total_merged += merged_in_window
            start = max(0, end - merged_in_window - LLM_MERGE_OVERLAP)
        else:
            start += step

    return sections, names, total_merged


def merge_sections_by_llm(
    sections: list[list[File]],
    names: list[str],
    vision_provider: VisionProvider,
    storage: StorageService,
) -> tuple[list[list[File]], list[str]]:
    if len(sections) <= 1:
        return sections, names

    pre_count = len(sections)

    for round_num in range(MAX_LLM_MERGE_ROUNDS):
        sections, names, merged = _llm_merge_pass(
            sections, names, vision_provider, storage
        )
        if merged == 0:
            break
        logger.info(
            f"LLM merge round {round_num + 1}: "
            f"combined {merged} sections ({len(sections)} remaining)"
        )

    total_merged = pre_count - len(sections)
    if total_merged:
        logger.info(f"LLM merge pass combined {total_merged} sections total")
    return sections, names
