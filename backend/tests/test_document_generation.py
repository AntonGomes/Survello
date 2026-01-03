# import os
# import sys
# import time
# import pytest
# from pathlib import Path
# from dotenv import load_dotenv
# from openai import OpenAI

# from app.services.openai_service import OpenAIService
# from app.core.logging import logger
# from app.utils.document_handler import prepare
# from app.prompts.doc_gen_prompt import DOC_GEN_SYSTEM_PROMPT_XLSX, DOC_GEN_SYSTEM_PROMPT_DOCX


# load_dotenv()

# FIXTURES_DIR = Path(__file__).parent / "fixtures"
# OUTPUT_DIR = Path(__file__).parent / "output"


# @pytest.fixture
# def openai_service():
#     api_key = os.getenv("OPENAI_API_KEY")
#     if not api_key:
#         pytest.skip("OPENAI_API_KEY not set in environment")
#     client = OpenAI(api_key=api_key)
#     return OpenAIService(client, api_key)


# def run_pipeline_test(template_path, context_paths, openai_service, save_output, file_type):
#     job_id = f"test_job_{file_type}_{int(time.time())}"
#     logger.info(f"Starting test job: {job_id}")

#     # 1. Load Files
#     with open(template_path, "rb") as f:
#         template_data = (template_path.name, f.read())

#     context_files_data = []
#     for p in context_paths:
#         with open(p, "rb") as f:
#             context_files_data.append((p.name, f.read()))

#     # 2. Prepare Bundle
#     bundle = prepare(
#         template=template_data,
#         context_files=context_files_data
#     )

#     # 3. Upload to OpenAI
#     client_container_bundle = openai_service.upload_bundle(
#         job_id=job_id,
#         bundle=bundle
#     )

#     # 4. Generation Phase
#     system_prompt = DOC_GEN_SYSTEM_PROMPT_XLSX if file_type == "xlsx" else DOC_GEN_SYSTEM_PROMPT_DOCX

#     stream = openai_service.stream_model_response(
#         container_bundle=client_container_bundle,
#         system_prompt=system_prompt.format(template_string=bundle.template_string),
#         user_input=f"The template file is called {client_container_bundle.template_container_file_id}. ",
#         model_name="gpt-5.2-2025-12-11",
#     )

#     # Consume stream
#     for chunk in stream:
#         if getattr(chunk, "type", "") == "response.output_text.done":
#             logger.info(f"[GEN OUTPUT] {chunk.text[:100]}...")

#     # 5. Download Final Document
#     file_data = openai_service.fetch_generated_file(
#         client_container_bundle.container_id,
#         client_container_bundle.template_container_file_id,
#     )

#     assert file_data is not None
#     assert len(file_data) > 0

#     if save_output:
#         OUTPUT_DIR.mkdir(exist_ok=True)
#         final_doc_path = OUTPUT_DIR / f"{job_id}_final.{file_type}"
#         with open(final_doc_path, "wb") as f:
#             f.write(file_data)
#         print(f"Final document saved to {final_doc_path}")

# def test_generation(openai_service, request):
#     save_output = request.config.getoption("--save-output")
#     file_type = request.config.getoption("--file-type")

#     input_dir = FIXTURES_DIR / f"{file_type}_inputs"
#     template_path = input_dir / f"example_template.{file_type}"

#     # Context: all other files in xlsx_inputs + 20 images
#     context_paths = [p for p in input_dir.iterdir() if p != template_path and not p.name.startswith(".")]

#     img_dir = FIXTURES_DIR / "context_images"
#     context_paths.extend(list(img_dir.iterdir())[:20])

#     run_pipeline_test(template_path, context_paths, openai_service, save_output, file_type)


#     """
#     USE:
#     uv run pytest tests/test_document_generation.py -s --log-cli-level=DEBUG --save-output --file-type docx
#     """
