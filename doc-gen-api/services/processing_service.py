from typing import AsyncGenerator

from sse_starlette import JSONServerSentEvent
from fastapi import HTTPException
from core.logger import logger
from core.config import client, OPENAI_API_KEY, DB_ROOT
from utils import is_image, is_document, convert_to_pdf, extract_comments
import requests
from services.upload_service import UploadService
from prompts.system import SYSTEM_PROMPT
from prompts.dilaps_input import DILAPS_INPUT


class ProcessingService:
    def __init__(self, job_id: str):
        self.job_id = job_id
        self.job_dir = DB_ROOT / self.job_id
        self.template_dir = self.job_dir / "template"
        self.context_dir = self.job_dir / "context"
        self.job_output_dir = self.job_dir / "output"
        self.job_output_dir.mkdir(exist_ok=True)

        # will be populated later
        self.template_file = None
        self.template_id = None
        self.template_cfile_id = None # the file gets a new id when its added to the container
        self.container = None
        self.payload = None
        self.images = []
        self.converted = []

    # ---------------------------------------------------------

    def process_docs(self):
        template_files = list(self.template_dir.glob("*"))
        if not template_files:
            error="No template file found in job template directory"
            logger.error(error)
            raise HTTPException(
                400, error
            )
        logger.debug(f"Template files: {template_files}")
        self.template_file = template_files[0]
        logger.debug(f"Template files: {self.template_file}")

        context_files = list(self.context_dir.glob("*"))
        self.images = [f for f in context_files if is_image(f)]
        documents = [f for f in context_files if is_document(f)]

        # PDF conversion
        pdfs = [f for f in documents if f.suffix.lower() == ".pdf"]

        converted = []
        for doc in documents:
            if doc.suffix.lower() in [".docx", ".xlsx"]:
                result = convert_to_pdf(doc, self.job_output_dir)
                if result is None:
                    return JSONServerSentEvent(
                        event="modelError", 
                        data="Document processing failed"
                        ).encode()
                converted.append(result)

        self.converted = pdfs + converted

    # ---------------------------------------------------------

    def upload_docs_to_client(self):
        # upload template
        self.template_id = UploadService.upload_document(self.template_file)

        # create container and store it
        self.container = client.containers.create(name=f"docgen-{self.job_id}")

        # attach template to the container
        attach_url = f"https://api.openai.com/v1/containers/{self.container.id}/files"

        res = requests.post(
            attach_url,
            json={"file_id": self.template_id},
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
        )

        if not res.ok:
            raise HTTPException(
                500, f"Failed to attach template to container: {res.text}"
            )

        logger.info(f"Template file {self.template_file} uploaded to container {self.container.id}")
        data = res.json()
        self.template_cfile_id = data["id"]

        # upload images / documents
        image_ids = [UploadService.upload_image(img) for img in self.images]
        document_ids = [UploadService.upload_document(doc) for doc in self.converted]

        self.payload = [
            {"type": "input_image", "file_id": fid} for fid in image_ids
        ] + [{"type": "input_file", "file_id": fid} for fid in document_ids]

    # ---------------------------------------------------------

    def _get_file(self):
        fetch_url = (
            f"https://api.openai.com/v1/containers/"
            f"{self.container.id}/files/{self.template_cfile_id}/content"
        )
        logger.debug(f"Fetching file with fetch_url {fetch_url}")

        res = requests.get(
            fetch_url, headers={"Authorization": f"Bearer {OPENAI_API_KEY}"}
        )

        if res.ok:
            output_path = self.job_output_dir / self.template_file.name
            logger.debug("Successfuly fetched file")

            with open(output_path, "wb") as f:
                f.write(res.content)
            logger.debug(f"Successfuly saved file to {str(output_path)}")

            return JSONServerSentEvent(
                event="completed",
                data=self.job_id,
            ).encode()
        else:
            logger.error(
                "Failed to fetch generated file: status=%s body=%s",
                res.status_code,
                res.text,
            )
            return JSONServerSentEvent(
                    event="modelError",
                    data="Failed to fetch generated file"
                ).encode()

    # ---------------------------------------------------------

    def stream_model_response(self) -> AsyncGenerator[str, None]:
        NANO = "gpt-5-nano-2025-08-07"
        MINI = "gpt-5-mini-2025-08-07"
        DEFAULT = "gpt-5-2025-08-07",
        try:
            response = client.responses.create(
                model=MINI,
                instructions=SYSTEM_PROMPT,
                input=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "input_text", "text": DILAPS_INPUT},
                            *self.payload,
                        ],
                    }
                ],
                tools=[{"type": "code_interpreter", "container": self.container.id}],
                tool_choice="required",
                stream=True,
            )
        except Exception as e:
            logger.error("Error in creating model response: %s", e)
            yield JSONServerSentEvent(event="modelError", data=str(e)).encode()
            return
        try:
            for chunk in response:
                output_text = ""
                match chunk.type:
                    case "response.output_text.done":
                        output_text=chunk.text
                    case "response.code_interpreter_call_code.done":
                        output_text=extract_comments(chunk.code)
                if output_text:

                    event = JSONServerSentEvent(
                        event=chunk.type,
                        data=output_text
                    )
                    logger.debug(f"event: {chunk.type}, data: {output_text}")
                    yield event.encode()

            yield self._get_file()

        except Exception as e:
            logger.error("Streaming error:", str(e))
            yield JSONServerSentEvent(event="modelError", data=str(e)).encode()
