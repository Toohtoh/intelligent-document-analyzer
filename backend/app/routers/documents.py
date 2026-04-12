from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.blob_service import BlobService
from app.services.ocr_service import OCRService
from app.services.ai_service import AIService
from app.models.document import DocumentResponse, DocumentStatus
from datetime import datetime
from pydantic import BaseModel
import uuid
import re

router = APIRouter()

ALLOWED_CONTENT_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/tiff",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

MAX_FILE_SIZE = 10 * 1024 * 1024


class QuestionRequest(BaseModel):
    document_id: str
    text: str
    question: str


def sanitize_filename(filename: str) -> str:
    """Clean filename — replace spaces and special chars with underscores."""
    filename = filename.strip()
    filename = re.sub(r'[^\w\-_\.]', '_', filename)
    filename = re.sub(r'_+', '_', filename)
    return filename


@router.post("/upload-and-analyze")
async def upload_and_analyze(file: UploadFile = File(...)):
    """
    Upload a document AND analyze it in one single call.
    1. Validates the file
    2. Uploads to Blob Storage
    3. Runs OCR with Document Intelligence
    4. Generates AI summary and extracts entities with GPT-4o
    5. Returns full results
    """

    # Validate file type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file.content_type}' not allowed. "
                   f"Allowed types: PDF, JPEG, PNG, TIFF, DOCX",
        )

    # Read file
    file_bytes = await file.read()

    # Validate size
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is 10MB.",
        )

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="File is empty.")

    # Clean filename
    clean_filename = sanitize_filename(file.filename)
    document_id = str(uuid.uuid4())

    # Step 1 — Upload to Blob Storage
    try:
        blob_service = BlobService()
        blob_name = await blob_service.upload_document(
            file_bytes=file_bytes,
            filename=clean_filename,
            document_id=document_id,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload file: {str(e)}",
        )

    # Step 2 — Run OCR
    try:
        ocr_service = OCRService()
        ocr_result = await ocr_service.extract_text(
            file_bytes=file_bytes,
            content_type=file.content_type,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"OCR analysis failed: {str(e)}",
        )

    # Step 3 — Generate AI summary and extract entities
    ai_summary = None
    ai_entities = {}
    try:
        ai_service = AIService()
        ai_summary = await ai_service.generate_summary(ocr_result["full_text"])
        ai_entities = await ai_service.extract_entities(ocr_result["full_text"])
    except Exception as e:
        # AI failure is non-blocking — we still return OCR results
        ai_summary = f"AI summary unavailable: {str(e)}"

    return {
        "document_id": document_id,
        "filename": clean_filename,
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size_bytes": len(file_bytes),
        "status": DocumentStatus.COMPLETED,
        "uploaded_at": datetime.utcnow(),
        "blob_name": blob_name,
        "ocr_result": {
            "page_count": ocr_result["page_count"],
            "word_count": ocr_result["word_count"],
            "full_text": ocr_result["full_text"],
            "tables_found": len(ocr_result["tables"]),
            "key_value_pairs": ocr_result["key_value_pairs"],
        },
        "ai_result": {
            "summary": ai_summary,
            "entities": ai_entities,
        },
    }


@router.post("/ask")
async def ask_question(request: QuestionRequest):
    """
    Ask a question about a document's content.
    """
    if not request.question or len(request.question.strip()) == 0:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Document text cannot be empty.")

    try:
        ai_service = AIService()
        answer = await ai_service.answer_question(
            text=request.text,
            question=request.question,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to answer question: {str(e)}",
        )

    return {
        "document_id": request.document_id,
        "question": request.question,
        "answer": answer,
    }


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload only — without analysis."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="File type not allowed.")

    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum 10MB.")

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="File is empty.")

    clean_filename = sanitize_filename(file.filename)
    document_id = str(uuid.uuid4())

    try:
        blob_service = BlobService()
        blob_name = await blob_service.upload_document(
            file_bytes=file_bytes,
            filename=clean_filename,
            document_id=document_id,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload file: {str(e)}",
        )

    return DocumentResponse(
        id=document_id,
        filename=clean_filename,
        status=DocumentStatus.PENDING,
        uploaded_at=datetime.utcnow(),
        message=f"File '{clean_filename}' uploaded successfully.",
    )


@router.get("/documents")
async def list_documents():
    """Placeholder — will be implemented on Jour 11 with Cosmos DB."""
    return {"documents": [], "message": "Coming soon — Jour 11"}