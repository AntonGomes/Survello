import os
import time
import pytest
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

from app.services.openai_service import OpenAIService
from app.utils.document_handler import prepare
from app.prompts.doc_gen_prompt import DOC_GEN_SYSTEM_PROMPT_DOCX


# Load environment variables
load_dotenv()


@pytest.fixture
def openai_service():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set in environment")
    client = OpenAI(api_key=api_key)
    return OpenAIService(client, api_key)


# Define paths to fixtures
FIXTURES_DIR = Path(__file__).parent / "fixtures"
OUTPUT_DIR = Path(__file__).parent / "output"


@pytest.fixture(scope="session", autouse=True)
def ensure_output_dir():
    """Ensure the output directory exists."""
    OUTPUT_DIR.mkdir(exist_ok=True)


def run_pipeline_test(
    template_path, context_paths, openai_service, save_output, output_dir, file_type
):
    job_id = f"test_job_{file_type}_{int(time.time())}"
    print(f"Starting test job: {job_id}")

    # 1. Load Files
    with open(template_path, "rb") as f:
        template_data = (template_path.name, f.read())

    context_files_data = []
    for p in context_paths:
        if p.exists():
            with open(p, "rb") as f:
                context_files_data.append((p.name, f.read()))
        else:
            print(f"Warning: Context file not found at {p}")

    # 2. Prepare Bundle
    bundle = prepare(template=template_data, context_files=context_files_data)

    # 3. Upload to OpenAI
    client_container_bundle = openai_service.upload_bundle(job_id=job_id, bundle=bundle)

    # 4. Generation Phase
    # Note: DOC_GEN_SYSTEM_PROMPT expects {template_json}.
    system_prompt = DOC_GEN_SYSTEM_PROMPT_DOCX.format(
        template_string=bundle.template_string
    )

    stream = openai_service.stream_model_response(
        container_bundle=client_container_bundle,
        system_prompt=system_prompt,
        user_input=f"The template file is called {client_container_bundle.template_container_file_id}. ",
        model_name="gpt-5.2-2025-12-11",
    )

    # Consume stream
    for chunk in stream:
        if getattr(chunk, "type", "") == "response.output_text.done":
            print(f"[GEN OUTPUT] {chunk.text[:100]}...")

    # 5. Download Final Document
    file_data = openai_service.fetch_generated_file(
        client_container_bundle.container_id,
        client_container_bundle.template_container_file_id,
    )

    assert file_data is not None
    assert len(file_data) > 0

    if request.config.getoption("--save-output"):
        final_doc_path = output_dir / f"{job_id}_final.{file_type}"
        with open(final_doc_path, "wb") as f:
            f.write(file_data)
        print(f"Final document saved to {final_doc_path}")


@pytest.mark.integration
def test_xlsx_generation(openai_service, request):
    # Setup paths
    input_dir = fixtures_dir / "docx_inputs"
    # Find first xlsx
    template_path = input_dir / "example_template.docx"

    # Context: all other files in xlsx_inputs + 20 images
    context_paths = [
        p
        for p in input_dir.iterdir()
        if p != template_path and not p.name.startswith(".")
    ]

    img_dir = fixtures_dir / "context_images"
    context_paths.extend(list(img_dir.iterdir())[:20])

    run_pipeline_test(
        template_path, context_paths, openai_service, save_output, output_dir, "xlsx"
    )
