from azure.storage.blob.aio import BlobServiceClient
from azure.identity.aio import DefaultAzureCredential
from app.config import get_settings
import uuid

settings = get_settings()


class BlobService:
    def __init__(self):
        self.account_url = (
            f"https://{settings.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net"
        )
        self.credential = DefaultAzureCredential()
        self.client = BlobServiceClient(
            account_url=self.account_url,
            credential=self.credential,
        )

    async def ping(self) -> bool:
        """Check that Blob Storage is reachable."""
        async with self.client:
            await self.client.get_account_information()
        return True

    async def upload_document(self, file_bytes: bytes, filename: str) -> str:
        """
        Upload a document to the 'documents' container.
        Returns the blob name (used as document ID).
        """
        blob_name = f"{uuid.uuid4()}/{filename}"
        async with self.client:
            container_client = self.client.get_container_client(
                settings.AZURE_STORAGE_CONTAINER_DOCUMENTS
            )
            await container_client.upload_blob(
                name=blob_name,
                data=file_bytes,
                overwrite=True,
            )
        return blob_name

    async def upload_result(self, result_data: str, document_id: str) -> str:
        """
        Upload analysis result JSON to the 'results' container.
        Returns the blob name.
        """
        blob_name = f"{document_id}/result.json"
        async with self.client:
            container_client = self.client.get_container_client(
                settings.AZURE_STORAGE_CONTAINER_RESULTS
            )
            await container_client.upload_blob(
                name=blob_name,
                data=result_data.encode("utf-8"),
                overwrite=True,
            )
        return blob_name

    async def download_document(self, blob_name: str) -> bytes:
        """Download a document by its blob name."""
        async with self.client:
            blob_client = self.client.get_blob_client(
                container=settings.AZURE_STORAGE_CONTAINER_DOCUMENTS,
                blob=blob_name,
            )
            stream = await blob_client.download_blob()
            return await stream.readall()