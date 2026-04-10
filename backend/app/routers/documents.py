from fastapi import APIRouter

router = APIRouter()


@router.get("/documents")
async def list_documents():
    """
    Placeholder — will be implemented on Jour 11.
    """
    return {"documents": [], "message": "Coming soon — Jour 11"}