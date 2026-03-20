"""Isolated clustering test — investigate grouping results on fixture images.

Runs the embedding-based clustering pipeline (stages 1-3) against real
Gemini embeddings and prints the resulting groups so you can see exactly
which images end up together.

Usage:
    # Full run (229 images, uses embedding cache after first run):
    uv run python test_clustering.py

    # Limit images for faster iteration:
    uv run python test_clustering.py --max-images 50

    # Force re-embed (ignore cache):
    uv run python test_clustering.py --no-cache

    # Show pairwise similarities between consecutive images:
    uv run python test_clustering.py --show-similarities

    # Tweak thresholds:
    uv run python test_clustering.py --break-threshold 0.6 --singleton-start 0.4 --adjacent-threshold 0.7
"""
from __future__ import annotations

import argparse
import json
import pickle
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

import numpy as np

FIXTURES_DIR = (
    Path(__file__).resolve().parent.parent.parent
    / "Survello-main"
    / "backend"
    / "tests"
    / "fixtures"
    / "context_images"
)
CACHE_FILE = Path(__file__).resolve().parent / ".embedding_cache.pkl"

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.utils.exif import extract_timestamp
from app.utils.similarity import centroid, cosine_similarity


@dataclass
class FakeFile:
    id: int
    file_name: str
    storage_key: str
    mime_type: str = "image/jpeg"
    _data: bytes | None = None
    _timestamp: datetime | None = None


def load_images(max_images: int | None) -> list[FakeFile]:
    paths = sorted(FIXTURES_DIR.glob("*.jpg"))
    if max_images:
        paths = paths[:max_images]
    files: list[FakeFile] = []
    for i, p in enumerate(paths):
        data = p.read_bytes()
        ts = extract_timestamp(data)
        f = FakeFile(
            id=i,
            file_name=p.name,
            storage_key=str(p),
            _data=data,
            _timestamp=ts,
        )
        files.append(f)
    return files


def order_by_timestamp(files: list[FakeFile]) -> list[FakeFile]:
    timestamped = [(f, f._timestamp.timestamp()) for f in files if f._timestamp]
    untimed = [(f, i) for i, f in enumerate(files) if not f._timestamp]
    if len(timestamped) > len(untimed):
        timestamped.sort(key=lambda x: x[1])
        return [f for f, _ in timestamped] + [f for f, _ in untimed]
    return files


def compute_embeddings(
    files: list[FakeFile],
    use_cache: bool,
) -> dict[int, list[float]]:
    cached: dict[str, list[float]] = {}
    if use_cache and CACHE_FILE.exists():
        cached = pickle.loads(CACHE_FILE.read_bytes())
        print(f"  Loaded {len(cached)} cached embeddings from {CACHE_FILE.name}")

    to_embed: list[tuple[int, FakeFile]] = []
    emb_map: dict[int, list[float]] = {}
    for f in files:
        if f.file_name in cached:
            emb_map[f.id] = cached[f.file_name]
        else:
            to_embed.append((f.id, f))

    if to_embed:
        print(f"  Computing embeddings for {len(to_embed)} images via Gemini...")
        from app.core.settings import get_settings
        from app.services.ai.gemini import GeminiEmbeddingProvider

        settings = get_settings()
        provider = GeminiEmbeddingProvider(api_key=settings.gemini_api_key or "")
        data_list = [f._data for _, f in to_embed]
        vectors = provider.embed_images(data_list)
        for (fid, f), vec in zip(to_embed, vectors, strict=True):
            emb_map[fid] = vec
            cached[f.file_name] = vec

        CACHE_FILE.write_bytes(pickle.dumps(cached))
        print(f"  Saved {len(cached)} embeddings to cache")
    else:
        print(f"  All {len(files)} embeddings loaded from cache")

    return emb_map


def window_centroid(
    section: list[FakeFile],
    emb_map: dict[int, list[float]],
    window_size: int,
) -> list[float]:
    tail = section[-window_size:]
    vecs = [emb_map[f.id] for f in tail if f.id in emb_map]
    return centroid(vecs) if vecs else []


def section_images(
    ordered: list[FakeFile],
    emb_map: dict[int, list[float]],
    break_threshold: float,
    break_window: int,
) -> list[list[FakeFile]]:
    sections: list[list[FakeFile]] = [[ordered[0]]]
    for i in range(1, len(ordered)):
        curr_emb = emb_map.get(ordered[i].id, [])
        if curr_emb:
            wc = window_centroid(sections[-1], emb_map, break_window)
            if wc and cosine_similarity(wc, curr_emb) < break_threshold:
                sections.append([])
        sections[-1].append(ordered[i])
    return sections


def section_centroid(
    section: list[FakeFile],
    emb_map: dict[int, list[float]],
) -> list[float]:
    vecs = [emb_map[f.id] for f in section if f.id in emb_map]
    return centroid(vecs) if vecs else []


def merge_singletons(
    sections: list[list[FakeFile]],
    emb_map: dict[int, list[float]],
    start_threshold: float,
    end_threshold: float,
    step: float,
) -> list[list[FakeFile]]:
    if len(sections) <= 1:
        return sections

    threshold = start_threshold
    while threshold <= end_threshold:
        if not any(len(s) == 1 for s in sections):
            break
        merged_indices: set[int] = set()
        for i, section in enumerate(sections):
            if len(section) != 1 or i in merged_indices:
                continue
            file_emb = emb_map.get(section[0].id, [])
            if not file_emb:
                continue
            best_idx, best_sim = -1, -1.0
            for j in (i - 1, i + 1):
                if j < 0 or j >= len(sections) or j in merged_indices:
                    continue
                nc = section_centroid(sections[j], emb_map)
                if not nc:
                    continue
                sim = cosine_similarity(file_emb, nc)
                if sim > best_sim:
                    best_sim = sim
                    best_idx = j
            if best_idx >= 0 and best_sim >= threshold:
                sections[best_idx].extend(section)
                merged_indices.add(i)
        if merged_indices:
            sections = [s for i, s in enumerate(sections) if i not in merged_indices]
            print(f"    Merged {len(merged_indices)} singletons at threshold {threshold:.2f}")
        threshold += step

    remaining = sum(1 for s in sections if len(s) == 1)
    if remaining:
        print(f"    {remaining} singletons remain after merge passes")
    return sections


def merge_similar_adjacent(
    sections: list[list[FakeFile]],
    emb_map: dict[int, list[float]],
    threshold: float,
) -> list[list[FakeFile]]:
    if len(sections) <= 1:
        return sections

    pre_count = len(sections)
    changed = True
    while changed:
        changed = False
        merged: list[list[FakeFile]] = [sections[0]]
        for i in range(1, len(sections)):
            pc = section_centroid(merged[-1], emb_map)
            cc = section_centroid(sections[i], emb_map)
            if pc and cc:
                sim = cosine_similarity(pc, cc)
                if sim >= threshold:
                    merged[-1].extend(sections[i])
                    changed = True
                    continue
            merged.append(sections[i])
        sections = merged

    merged_count = pre_count - len(sections)
    if merged_count:
        print(f"    Merged {merged_count} adjacent sections at threshold {threshold:.2f}")
    return sections


def name_sections_for_llm(
    sections: list[list[FakeFile]],
) -> list[str]:
    from app.core.settings import get_settings
    from app.services.ai.gemini import GeminiVisionProvider

    settings = get_settings()
    vision = GeminiVisionProvider(api_key=settings.gemini_api_key or "")

    representative_images = [s[len(s) // 2]._data for s in sections]
    MAX_BATCH = 10
    all_names: list[str] = []
    for i in range(0, len(representative_images), MAX_BATCH):
        batch = representative_images[i : i + MAX_BATCH]
        names = vision.name_sections(batch)
        all_names.extend(names)

    while len(all_names) < len(sections):
        all_names.append(f"Section {len(all_names) + 1}")
    return all_names[: len(sections)]


def run_llm_merge(
    sections: list[list[FakeFile]],
    ordered: list[FakeFile],
    window: int,
    overlap: int,
    max_rounds: int,
) -> list[list[FakeFile]]:
    from app.core.settings import get_settings
    from app.services.ai.gemini import GeminiVisionProvider

    settings = get_settings()
    vision = GeminiVisionProvider(api_key=settings.gemini_api_key or "")

    print("  Naming sections via LLM...")
    names = name_sections_for_llm(sections)
    for i, name in enumerate(names):
        print(f"    Section {i+1}: {name} [{len(sections[i])} images]")

    step = window - overlap
    pre_count = len(sections)

    for round_num in range(max_rounds):
        total_merged = 0
        start = 0
        while start < len(sections):
            end = min(start + window, len(sections))
            window_images = [s[len(s) // 2]._data for s in sections[start:end]]
            window_names = names[start:end]

            merge_groups = vision.suggest_merges(window_images, window_names)
            if merge_groups:
                absolute_groups = [
                    [idx + start for idx in group] for group in merge_groups
                ]
                absorbed: set[int] = set()
                for group in absolute_groups:
                    valid = [
                        i for i in group
                        if 0 <= i < len(sections) and i not in absorbed
                    ]
                    if len(valid) < 2:
                        continue
                    target = valid[0]
                    for src in valid[1:]:
                        sections[target].extend(sections[src])
                        absorbed.add(src)
                    names[target] = names[valid[0]]

                if absorbed:
                    sections = [
                        s for i, s in enumerate(sections) if i not in absorbed
                    ]
                    names = [
                        n for i, n in enumerate(names) if i not in absorbed
                    ]
                    merged_in_window = len(absorbed)
                    total_merged += merged_in_window
                    print(f"    Round {round_num+1}: merged {merged_in_window} sections in window [{start}:{end}]")
                    start = max(0, end - merged_in_window - overlap)
                else:
                    start += step
            else:
                start += step

        if total_merged == 0:
            break
        print(f"    Round {round_num+1} total: merged {total_merged} sections ({len(sections)} remaining)")

    total = pre_count - len(sections)
    if total:
        print(f"    LLM merge combined {total} sections total")
    return sections


def print_similarities(
    ordered: list[FakeFile],
    emb_map: dict[int, list[float]],
) -> None:
    print("\n=== Consecutive Image Similarities ===")
    print(f"{'Index':>5}  {'Similarity':>10}  {'Image A':<30}  {'Image B':<30}")
    print("-" * 80)
    for i in range(1, len(ordered)):
        a_emb = emb_map.get(ordered[i - 1].id, [])
        b_emb = emb_map.get(ordered[i].id, [])
        if a_emb and b_emb:
            sim = cosine_similarity(a_emb, b_emb)
            marker = " ***BREAK***" if sim < 0.75 else ""
            print(
                f"{i:>5}  {sim:>10.4f}  "
                f"{ordered[i-1].file_name:<30}  "
                f"{ordered[i].file_name:<30}{marker}"
            )


def print_results(sections: list[list[FakeFile]]) -> None:
    print(f"\n{'='*60}")
    print(f"  FINAL RESULT: {len(sections)} sections")
    print(f"{'='*60}")

    sizes = [len(s) for s in sections]
    singleton_count = sum(1 for s in sizes if s == 1)
    print(f"  Singletons: {singleton_count}/{len(sections)}")
    print(f"  Sizes: min={min(sizes)}, max={max(sizes)}, avg={sum(sizes)/len(sizes):.1f}")
    print()

    for i, section in enumerate(sections):
        ts_range = ""
        timestamps = [f._timestamp for f in section if f._timestamp]
        if timestamps:
            t_min = min(timestamps).strftime("%H:%M:%S")
            t_max = max(timestamps).strftime("%H:%M:%S")
            ts_range = f"  ({t_min} - {t_max})" if t_min != t_max else f"  ({t_min})"

        print(f"Section {i+1} [{len(section)} images]{ts_range}")
        for f in section:
            print(f"    {f.file_name}")
        print()


def main() -> None:
    parser = argparse.ArgumentParser(description="Isolated clustering test")
    parser.add_argument("--max-images", type=int, default=None)
    parser.add_argument("--no-cache", action="store_true")
    parser.add_argument("--show-similarities", action="store_true")
    parser.add_argument("--break-threshold", type=float, default=0.75)
    parser.add_argument("--singleton-start", type=float, default=0.55)
    parser.add_argument("--singleton-step", type=float, default=0.05)
    parser.add_argument("--adjacent-threshold", type=float, default=0.88)
    parser.add_argument("--break-window", type=int, default=5)
    parser.add_argument("--json", action="store_true", help="Output results as JSON")
    parser.add_argument("--llm-merge", action="store_true", help="Run LLM merge pass (stage 4)")
    parser.add_argument("--llm-merge-window", type=int, default=15)
    parser.add_argument("--llm-merge-overlap", type=int, default=5)
    parser.add_argument("--llm-merge-rounds", type=int, default=3)
    args = parser.parse_args()

    if not FIXTURES_DIR.exists():
        raise RuntimeError(f"Fixture dir not found: {FIXTURES_DIR}")

    print("=== Clustering Test ===")
    print(f"  Break threshold:    {args.break_threshold}")
    print(f"  Break window:       {args.break_window}")
    print(f"  Singleton merge:    {args.singleton_start} -> {args.break_threshold} (step {args.singleton_step})")
    print(f"  Adjacent threshold: {args.adjacent_threshold}")
    print()

    files = load_images(args.max_images)
    print(f"Loaded {len(files)} images")

    emb_map = compute_embeddings(files, use_cache=not args.no_cache)

    ordered = order_by_timestamp(files)
    print(f"\nOrdered {len(ordered)} images by timestamp")

    if args.show_similarities:
        print_similarities(ordered, emb_map)

    print("\n--- Stage 1: Break-point detection ---")
    sections = section_images(ordered, emb_map, args.break_threshold, args.break_window)
    print(f"  Initial sections: {len(sections)}")
    singleton_count = sum(1 for s in sections if len(s) == 1)
    print(f"  Singletons: {singleton_count}")

    print("\n--- Stage 2: Singleton elimination ---")
    sections = merge_singletons(
        sections, emb_map,
        args.singleton_start, args.break_threshold, args.singleton_step,
    )
    print(f"  Sections after singleton merge: {len(sections)}")

    print("\n--- Stage 3: Adjacent section merge ---")
    sections = merge_similar_adjacent(sections, emb_map, args.adjacent_threshold)
    print(f"  Sections after adjacent merge: {len(sections)}")

    if args.llm_merge:
        print("\n--- Stage 4: LLM merge pass ---")
        sections = run_llm_merge(
            sections, ordered,
            args.llm_merge_window, args.llm_merge_overlap, args.llm_merge_rounds,
        )
        print(f"  Sections after LLM merge: {len(sections)}")

    if args.json:
        result = []
        for i, section in enumerate(sections):
            result.append({
                "section": i + 1,
                "count": len(section),
                "files": [f.file_name for f in section],
            })
        print(json.dumps(result, indent=2))
    else:
        print_results(sections)


if __name__ == "__main__":
    main()
