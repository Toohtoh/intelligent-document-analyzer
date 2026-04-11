from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.blob_service import BlobService
from app.services.ocr_service import OCRService
from app.models.document import DocumentMetadata, DocumentResponse, DocumentStatus
from datetime import datetime
import uuid

router = APIRouter()

ALLOWED_CONTENT_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/tiff",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a document (PDF, image, DOCX) to Azure Blob Storage.
    Returns a document ID to track the analysis.
    """
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file.content_type}' not allowed. "
                   f"Allowed types: PDF, JPEG, PNG, TIFF, DOCX",
        )

    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is 10MB, "
                   f"got {len(file_bytes) / 1024 / 1024:.2f}MB",
        )

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="File is empty.")

    document_id = str(uuid.uuid4())

    try:
        blob_service = BlobService()
        blob_name = await blob_service.upload_document(
            file_bytes=file_bytes,
            filename=file.filename,
            document_id=document_id,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload file to storage: {str(e)}",
        )

    return DocumentResponse(
        id=document_id,
        filename=file.filename,
        status=DocumentStatus.PENDING,
        uploaded_at=datetime.utcnow(),
        message=f"File '{file.filename}' uploaded successfully. Ready for analysis.",
    )


@router.post("/analyze/{document_id}")
async def analyze_document(document_id: str, filename: str, content_type: str):
    """
    Trigger OCR analysis on an uploaded document.
    Downloads the file from Blob Storage and sends it to Document Intelligence.
    """
    # Download file from Blob Storage
    try:
        blob_service = BlobService()
        blob_name = f"{document_id}/{filename}"
        file_bytes = await blob_service.download_document(blob_name=blob_name)
    except Exception as e:
        raise HTTPException(
            status_code=404,
            detail=f"Document not found in storage: {str(e)}",
        )

    # Run OCR
    try:
        ocr_service = OCRService()
        ocr_result = await ocr_service.extract_text(
            file_bytes=file_bytes,
            content_type=content_type,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"OCR analysis failed: {str(e)}",
        )

    return {
        "document_id": document_id,
        "filename": filename,
        "status": DocumentStatus.COMPLETED,
        "ocr_result": ocr_result,
    }


@router.get("/documents")
async def list_documents():
    """Placeholder — will be implemented on Jour 11 with Cosmos DB."""
    return {"documents": [], "message": "Coming soon — Jour 11"}