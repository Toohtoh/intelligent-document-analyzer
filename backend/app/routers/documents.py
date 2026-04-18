from app.auth import verify_token
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.services.blob_service import BlobService
from app.services.ocr_service import OCRService
from app.services.ai_service import AIService
from app.services.cosmos_service import CosmosService
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
    filename = filename.strip()
    filename = re.sub(r'[^\w\-_\.]', '_', filename)
    filename = re.sub(r'_+', '_', filename)
    return filename


@router.post("/upload-and-analyze")
async def upload_and_analyze(
    file: UploadFile = File(...),
    token: dict = Depends(verify_token),
):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file.content_type}' not allowed.",
        )

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
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

    try:
        ocr_service = OCRService()
        ocr_result = await ocr_service.extract_text(
            file_bytes=file_bytes,
            content_type=file.content_type,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")

    ai_summary = None
    ai_entities = {}
    ai_document_type = "unknown"
    try:
        ai_service = AIService()
        ai_summary = await ai_service.generate_summary(ocr_result["full_text"])
        ai_entities = await ai_service.extract_entities(ocr_result["full_text"])
        ai_document_type = await ai_service.classify_document(ocr_result["full_text"])
    except Exception as e:
        ai_summary = f"AI summary unavailable: {str(e)}"

    result = {
        "document_id": document_id,
        "filename": clean_filename,
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size_bytes": len(file_bytes),
        "status": DocumentStatus.COMPLETED,
        "uploaded_at": datetime.utcnow().isoformat(),
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
            "document_type": ai_document_type,
        },
    }

    try:
        cosmos_service = CosmosService()
        await cosmos_service.save_document(result.copy())
    except Exception as e:
        result["cosmos_warning"] = f"Results not saved to DB: {str(e)}"

    return result


@router.get("/documents")
async def list_documents(
    limit: int = 20,
    token: dict = Depends(verify_token),
):
    try:
        cosmos_service = CosmosService()
        documents = await cosmos_service.list_documents(limit=limit)
        return {
            "count": len(documents),
            "documents": documents,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve documents: {str(e)}",
        )


@router.get("/documents/{document_id}")
async def get_document(
    document_id: str,
    token: dict = Depends(verify_token),
):
    try:
        cosmos_service = CosmosService()
        document = await cosmos_service.get_document(document_id)
        return document
    except Exception as e:
        raise HTTPException(
            status_code=404,
            detail=f"Document not found: {str(e)}",
        )


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    token: dict = Depends(verify_token),
):
    try:
        cosmos_service = CosmosService()
        await cosmos_service.delete_document(document_id)
        return {"message": f"Document {document_id} deleted successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=404,
            detail=f"Document not found: {str(e)}",
        )


@router.post("/ask")
async def ask_question(
    request: QuestionRequest,
    token: dict = Depends(verify_token),
):
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
        raise HTTPException(status_code=500, detail=f"Failed to answer: {str(e)}")

    return {
        "document_id": request.document_id,
        "question": request.question,
        "answer": answer,
    }


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    token: dict = Depends(verify_token),
):
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
        await blob_service.upload_document(
            file_bytes=file_bytes,
            filename=clean_filename,
            document_id=document_id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload: {str(e)}")

    return DocumentResponse(
        id=document_id,
        filename=clean_filename,
        status=DocumentStatus.PENDING,
        uploaded_at=datetime.utcnow(),
        message=f"File '{clean_filename}' uploaded successfully.",
    )