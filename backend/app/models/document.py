from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


class DocumentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class DocumentMetadata(BaseModel):
    id: str = Field(..., description="Unique document ID (blob name)")
    filename: str
    content_type: str
    size_bytes: int
    status: DocumentStatus = DocumentStatus.PENDING
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    blob_name: Optional[str] = None
    result_blob_name: Optional[str] = None
    error_message: Optional[str] = None


class DocumentResponse(BaseModel):
    id: str
    filename: str
    status: DocumentStatus
    uploaded_at: datetime
    message: str