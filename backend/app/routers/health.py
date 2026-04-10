from fastapi import APIRouter
from app.config import get_settings
from app.services.blob_service import BlobService
import time

router = APIRouter()
settings = get_settings()


@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    Verifies the app is running and Blob Storage is reachable.
    """
    start = time.time()
    checks = {}

    # Check Blob Storage connectivity
    try:
        blob_service = BlobService()
        await blob_service.ping()
        checks["blob_storage"] = "ok"
    except Exception as e:
        checks["blob_storage"] = f"error: {str(e)}"

    elapsed = round((time.time() - start) * 1000, 2)

    all_ok = all(v == "ok" for v in checks.values())

    return {
        "status": "healthy" if all_ok else "degraded",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "response_time_ms": elapsed,
        "checks": checks,
    }