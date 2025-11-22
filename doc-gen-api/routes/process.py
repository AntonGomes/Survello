from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from core.logger import logger
from services.processing_service import ProcessingService

router = APIRouter()


@router.get("/process/{job_id}")
def process(job_id: str):

    logger.info(f"Starting processing for job_id={job_id}")

    service = ProcessingService(job_id)

    logger.info("Proccessing docs")
    service.process_docs()

    logger.info("Uploading docs to client")
    service.upload_docs_to_client()

    return StreamingResponse(
        service.stream_model_response(), media_type="text/event-stream"
    )
