from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.blob_service import BlobService
from app.models.document import DocumentMetadata, DocumentResponse, DocumentStatus
from datetime import datetime
import uuid

router = APIRouter()

# Allowed file types
ALLOWED_CONTENT_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/tiff",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

# Max file size: 10MB
MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a document (PDF, image, DOCX) to Azure Blob Storage.
    Returns a document ID to track the analysis.
    """

    # Validate file type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file.content_type}' not allowed. "
                   f"Allowed types: PDF, JPEG, PNG, TIFF, DOCX",
        )

    # Read file content
    file_bytes = await file.read()

    # Validate file size
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is 10MB, "
                   f"got {len(file_bytes) / 1024 / 1024:.2f}MB",
        )

    # Validate not empty
    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="File is empty.",
        )

    # Generate document ID
    document_id = str(uuid.uuid4())

    # Upload to Blob Storage
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

    # Build metadata
    metadata = DocumentMetadata(
        id=document_id,
        filename=file.filename,
        content_type=file.content_type,
        size_bytes=len(file_bytes),
        status=DocumentStatus.PENDING,
        uploaded_at=datetime.utcnow(),
        blob_name=blob_name,
    )

    return DocumentResponse(
        id=metadata.id,
        filename=metadata.filename,
        status=metadata.status,
        uploaded_at=metadata.uploaded_at,
        message=f"File '{file.filename}' uploaded successfully. Ready for analysis.",
    )


@router.get("/documents")
async def list_documents():
    """
    Placeholder — will be implemented on Jour 11 with Cosmos DB.
    """
    return {"documents": [], "message": "Coming soon — Jour 11"}