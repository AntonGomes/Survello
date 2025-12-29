import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

# Add backend directory to path so we can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.services.openai_service import OpenAIService
from app.utils.document_handler import prepare
from app.prompts.doc_analysis_prompt import DOC_ANALYSIS_SYSTEM_PROMPT
from app.prompts.doc_gen_prompt import DOC_GEN_SYSTEM_PROMPT
from app.utils.files import extract_comments
from helpers import compare_spreadsheets, excel_to_json

# Load environment variables
load_dotenv()

def main():
    # Configuration
    # Adjust these paths as needed or make them command line arguments
    base_path = Path(__file__).parent.parent.parent
    template_path = base_path / "spikes/examples/mvp_test/template/example_final_dilaps.xlsx"
    # Using a few context files from the example
    context_paths = [
        base_path / "spikes/examples/mvp_test/sauchihall_st/site_notes.docx",
        base_path / "spikes/examples/mvp_test/sauchihall_st/lease.pdf",
    ] + [
        # only upload 20 random images excluding hidden files
        *list((base_path / "spikes/examples/mvp_test/context_images").iterdir())[:2]
    ]
    
    output_dir = base_path / "backend/scripts/output"
    output_dir.mkdir(exist_ok=True)
    
    job_id = f"test_job_{int(time.time())}"
    print(f"Starting test job: {job_id}")

    # 1. Load Files
    print("Loading files...")
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
    print("Preparing document bundle...")
    try:
        bundle = prepare(
            template=template_data,
            context_files=context_files_data,
            on_log=lambda msg: print(f"[PREPARE LOG] {msg}"),
            on_progress=lambda done, total: print(f"[PREPARE PROGRESS] {done*100/total}%")
        )
    except Exception as e:
        print(f"Error preparing bundle: {e}")
        return

    # 3. Upload to OpenAI
    print("Uploading to OpenAI...")
    api_key = os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=api_key)
    openai_service = OpenAIService(client, api_key)

    try:
        client_container_bundle = openai_service.upload_bundle(
            job_id=job_id,
            bundle=bundle,
            on_progress=lambda done, total: print(f"[UPLOAD PROGRESS] {done*100/total}%")
        )
    except Exception as e:
        print(f"Error uploading bundle: {e}")
        return

    #  Generation Phase
    print("\n--- Starting Generation Phase ---")

    template_json = excel_to_json(template_path)
    
    try:
        print(f"Payload {client_container_bundle.payload}")
        print(f"Template Container File ID: {client_container_bundle.template_container_file_id}")
        print(f"Container ID: {client_container_bundle.container_id}")
        stream = openai_service.stream_model_response(
            container_bundle=client_container_bundle,
            system_prompt=DOC_GEN_SYSTEM_PROMPT.format(template_json=template_json),
            user_input=f"The template file is called {client_container_bundle.template_container_file_id}. ", 
            model_name="gpt-5.2-2025-12-11",
        )

        for chunk in stream:
            output_text = ""
            if getattr(chunk, "type", "") == "response.output_text.done":
                output_text = chunk.text
                print(f"[GEN OUTPUT] {output_text}...")
            elif getattr(chunk, "type", "") == "response.code_interpreter_call_code.done":
                output_text = extract_comments(chunk.code)
                if output_text:
                    print(f"[GEN LOG] {output_text}")

    except Exception as e:
        print(f"Error during generation: {e}")
        return

    # 6. Download Final Document
    print("\n--- Fetching Final Document ---")
    try:
        file_data = openai_service.fetch_generated_file(
            client_container_bundle.container_id,
            client_container_bundle.template_container_file_id,
        )
        
        final_doc_path = output_dir / f"{job_id}_final_document.xlsx" # Assuming xlsx based on template
        with open(final_doc_path, "wb") as f:
            f.write(file_data)
        print(f"Final document saved to {final_doc_path}")

    except Exception as e:
        print(f"Error fetching final document: {e}")

    # 7. Compare with Expected Output (if available)
    print("\n--- Comparing with Expected Output ---")
    try:
        differences = compare_spreadsheets(template_path, final_doc_path)
        return differences['average_similarity']
    except Exception as e:
        print(f"Error comparing documents: {e}")

if __name__ == "__main__":
    scores = []
    for i in range(1):
        avg = main()
        scores.append(avg)
        print(f"Run {i+1} average similarity: {avg}")
       
    # if scores:
    #     overall_avg = sum(scores) / len(scores)
    #     print(f"\nOverall average similarity across runs: {overall_avg}")
    #     print(f"Scores: {scores}")
    
    
