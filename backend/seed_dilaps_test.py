"""Seed a dilaps test run using fixture data from Survello-main.

Usage:
    # Mock both vision and embedding (fastest, tests UI only):
    MOCK_DILAPS_VISION=true MOCK_DILAPS_EMBEDDING=true uv run python seed_dilaps_test.py

    # Real embeddings, mock vision (test clustering, cached after first run):
    MOCK_DILAPS_VISION=true uv run python seed_dilaps_test.py

    # Real vision, mock embedding (test LLM analysis output):
    MOCK_DILAPS_EMBEDDING=true uv run python seed_dilaps_test.py

    # Everything real (full end-to-end):
    uv run python seed_dilaps_test.py

    # Limit images (faster iteration):
    uv run python seed_dilaps_test.py --max-images 30

    # Skip seeding if files already exist (re-run orchestration only):
    uv run python seed_dilaps_test.py --rerun

    # Force recompute embeddings (e.g. after switching from mock to real):
    MOCK_DILAPS_VISION=true uv run python seed_dilaps_test.py --rerun --clear-embeddings
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

FIXTURES_ROOT = Path(__file__).resolve().parent.parent.parent / "Survello-main" / "backend" / "tests" / "fixtures"
CONTEXT_IMAGES_DIR = FIXTURES_ROOT / "context_images"
XLSX_INPUTS_DIR = FIXTURES_ROOT / "xlsx_inputs"

LEASE_PDF = XLSX_INPUTS_DIR / "lease.pdf"
SITE_NOTES = XLSX_INPUTS_DIR / "site_notes.docx"

STORAGE_PREFIX = "test-dilaps"
PROPERTY_ADDRESS = "123 Test Street, London, SW1A 1AA"

os.environ.setdefault("DATABASE_URL", "")

sys.path.insert(0, str(Path(__file__).resolve().parent))

from sqlmodel import Session, select

from app.core.db import engine
from app.core.s3 import S3Client
from app.core.settings import get_settings
from app.models.embedding_model import ImageEmbedding
from app.models.file_model import File, FileRole
from app.models.run_model import Run, RunFileLink
from app.models.user_model import User
from app.services.storage import StorageService


def get_storage() -> StorageService:
    settings = get_settings()
    client = S3Client(
        bucket_name=settings.s3_bucket_name or "",
        region=settings.aws_default_region or "eu-north-1",
        endpoint_url=settings.s3_endpoint_url,
        access_key=settings.aws_access_key,
        secret_key=settings.aws_secret_key,
    )
    return StorageService(client)


def get_user(db: Session) -> User:
    user = db.exec(select(User).limit(1)).first()
    if not user:
        raise RuntimeError("No users in database. Log in via the UI first.")
    return user


def upload_and_create_file(
    db: Session,
    storage: StorageService,
    local_path: Path,
    storage_key: str,
    mime_type: str,
    role: FileRole,
    org_id: int,
    user_id: int,
) -> File:
    existing = db.exec(select(File).where(File.storage_key == storage_key)).first()
    if existing:
        print(f"  [cached] {local_path.name} → {storage_key}")
        return existing

    data = local_path.read_bytes()
    storage.upload_file(storage_key, data)

    f = File(
        file_name=local_path.name,
        storage_key=storage_key,
        mime_type=mime_type,
        size_bytes=len(data),
        role=role,
        org_id=org_id,
        uploaded_by_user_id=user_id,
    )
    db.add(f)
    db.flush()
    print(f"  [upload] {local_path.name} → {storage_key} (file_id={f.id})")
    return f


def seed_files(
    db: Session,
    storage: StorageService,
    user: User,
    max_images: int | None,
) -> tuple[File, list[File]]:
    org_id = user.org_id
    user_id = user.id

    lease_file = upload_and_create_file(
        db, storage, LEASE_PDF,
        f"{STORAGE_PREFIX}/lease.pdf",
        "application/pdf",
        FileRole.TEMPLATE,
        org_id, user_id,
    )

    context_files: list[File] = []

    site_notes_file = upload_and_create_file(
        db, storage, SITE_NOTES,
        f"{STORAGE_PREFIX}/site_notes.docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        FileRole.INPUT,
        org_id, user_id,
    )
    context_files.append(site_notes_file)

    image_paths = sorted(CONTEXT_IMAGES_DIR.glob("*.jpg"))
    if max_images:
        image_paths = image_paths[:max_images]

    print(f"\nUploading {len(image_paths)} images...")
    for img_path in image_paths:
        key = f"{STORAGE_PREFIX}/images/{img_path.name}"
        f = upload_and_create_file(
            db, storage, img_path, key,
            "image/jpeg", FileRole.INPUT,
            org_id, user_id,
        )
        context_files.append(f)

    db.commit()
    return lease_file, context_files


def find_and_reset_existing_run(db: Session) -> int | None:
    from app.models.dilaps_model import (
        DilapsItem,
        DilapsRun,
        DilapsSection,
        DilapsSectionFileLink,
        DilapsStatus,
    )

    run = db.exec(
        select(DilapsRun)
        .where(DilapsRun.property_address == PROPERTY_ADDRESS)
        .order_by(DilapsRun.id.desc())
    ).first()
    if not run:
        return None

    sections = db.exec(
        select(DilapsSection).where(DilapsSection.dilaps_run_id == run.id)
    ).all()
    for section in sections:
        for item in db.exec(select(DilapsItem).where(DilapsItem.section_id == section.id)).all():
            db.delete(item)
        db.flush()
        for link in db.exec(select(DilapsSectionFileLink).where(DilapsSectionFileLink.section_id == section.id)).all():
            db.delete(link)
        db.flush()
        db.delete(section)

    run.status = DilapsStatus.IDLE
    run.progress_pct = 0
    run.error_message = None
    db.commit()
    print(f"  Reset dilaps run {run.id} (cleared {len(sections)} sections)")
    return run.id


def create_dilaps_run(
    db: Session,
    user: User,
    lease_file: File,
    context_files: list[File],
) -> int:
    from app.models.dilaps_model import DilapsRun

    run = Run(
        org_id=user.org_id,
        created_by_user_id=user.id,
        template_file_id=lease_file.id,
    )
    run.context_files = context_files
    db.add(run)
    db.flush()

    dilaps_run = DilapsRun(
        run_id=run.id,
        property_address=PROPERTY_ADDRESS,
        lease_summary=None,
        org_id=user.org_id,
        created_by_user_id=user.id,
    )
    db.add(dilaps_run)
    db.commit()
    db.refresh(dilaps_run)
    return dilaps_run.id


def run_orchestrator(dilaps_id: int, db: Session, storage: StorageService) -> None:
    from app.models.dilaps_model import DilapsRun
    from app.orchestrators.dilaps import execute

    settings = get_settings()

    if settings.mock_dilaps_vision or settings.use_mock_llm:
        from app.services.ai.mock import MockVisionProvider
        vision = MockVisionProvider()
    else:
        from app.services.ai.gemini import GeminiVisionProvider
        vision = GeminiVisionProvider(api_key=settings.gemini_api_key or "")

    if settings.mock_dilaps_embedding or settings.use_mock_llm:
        from app.services.ai.mock import MockEmbeddingProvider
        embedding = MockEmbeddingProvider()
    else:
        from app.services.ai.gemini import GeminiEmbeddingProvider
        embedding = GeminiEmbeddingProvider(api_key=settings.gemini_api_key or "")

    dilaps_run = db.get(DilapsRun, dilaps_id)
    if not dilaps_run:
        raise RuntimeError(f"DilapsRun {dilaps_id} not found")

    mock_vision = settings.mock_dilaps_vision or settings.use_mock_llm
    mock_embed = settings.mock_dilaps_embedding or settings.use_mock_llm
    print(f"\nRunning orchestrator (dilaps_id={dilaps_id})...")
    print(f"  Vision:    {'MOCK' if mock_vision else 'REAL (Gemini)'}")
    print(f"  Embedding: {'MOCK' if mock_embed else 'REAL (Gemini)'}")

    cached_count = db.exec(
        select(ImageEmbedding).where(
            ImageEmbedding.file_id.in_(
                [f.id for f in dilaps_run.run.context_files if f.mime_type.startswith("image/")]
            )
        )
    ).all()
    if cached_count:
        print(f"  Embedding cache: {len(cached_count)} images already embedded")

    execute(dilaps_run, db, storage, vision, embedding)


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed a dilaps test run")
    parser.add_argument("--max-images", type=int, default=None, help="Limit number of images")
    parser.add_argument("--rerun", action="store_true", help="Re-run orchestrator on last seeded run")
    parser.add_argument("--clear-embeddings", action="store_true", help="Clear cached embeddings to force recompute")
    args = parser.parse_args()

    if not CONTEXT_IMAGES_DIR.exists():
        raise RuntimeError(f"Fixture dir not found: {CONTEXT_IMAGES_DIR}")

    storage = get_storage()
    settings = get_settings()

    print("=== Dilaps Test Seed ===")
    print(f"  MOCK_DILAPS_VISION:    {settings.mock_dilaps_vision}")
    print(f"  MOCK_DILAPS_EMBEDDING: {settings.mock_dilaps_embedding}")
    print(f"  USE_MOCK_LLM:          {settings.use_mock_llm}")
    print()

    with Session(engine) as db:
        user = get_user(db)
        print(f"Using user: {user.name} (id={user.id}, org={user.org_id})")

        if args.rerun:
            dilaps_id = find_and_reset_existing_run(db)
            if not dilaps_id:
                raise RuntimeError("No existing run found. Run without --rerun first.")
            print(f"\nRe-running existing dilaps run {dilaps_id}")
        else:
            lease_file, context_files = seed_files(db, storage, user, args.max_images)
            image_count = sum(1 for f in context_files if f.mime_type.startswith("image/"))
            doc_count = len(context_files) - image_count
            print(f"\nSeeded: {image_count} images, {doc_count} docs, 1 lease")

            dilaps_id = create_dilaps_run(db, user, lease_file, context_files)
            print(f"Created DilapsRun id={dilaps_id}")

        if args.clear_embeddings:
            cleared = 0
            for emb in db.exec(select(ImageEmbedding)).all():
                db.delete(emb)
                cleared += 1
            db.commit()
            print(f"  Cleared {cleared} cached embeddings")

        run_orchestrator(dilaps_id, db, storage)

    frontend_port = os.environ.get("FRONTEND_PORT", "3104")
    print(f"\n=== Done! ===")
    print(f"Review at: http://localhost:{frontend_port}/app/generate/review?dilapsId={dilaps_id}")


if __name__ == "__main__":
    main()
