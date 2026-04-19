from azure.storage.blob.aio import BlobServiceClient
from azure.identity.aio import ManagedIdentityCredential
from app.config import get_settings
import uuid

settings = get_settings()


class BlobService:
    def __init__(self):
        self.account_url = (
            f"https://{settings.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net"
        )

    def _get_client_direct(self):
        if settings.AZURE_STORAGE_KEY:
            conn_str = (
                f"DefaultEndpointsProtocol=https;"
                f"AccountName={settings.AZURE_STORAGE_ACCOUNT_NAME};"
                f"AccountKey={settings.AZURE_STORAGE_KEY};"
                f"EndpointSuffix=core.windows.net"
            )
            return BlobServiceClient.from_connection_string(conn_str)
        return BlobServiceClient(
            account_url=self.account_url,
            credential=ManagedIdentityCredential(),
        )

    async def ping(self) -> bool:
        async with self._get_client_direct() as client:
            await client.get_account_information()
        return True

    async def upload_document(
        self, file_bytes: bytes, filename: str, document_id: str = None
    ) -> str:
        if document_id is None:
            document_id = str(uuid.uuid4())
        blob_name = f"{document_id}/{filename}"
        async with self._get_client_direct() as client:
            container_client = client.get_container_client(
                settings.AZURE_STORAGE_CONTAINER_DOCUMENTS
            )
            await container_client.upload_blob(
                name=blob_name,
                data=file_bytes,
                overwrite=True,
            )
        return blob_name

    async def upload_result(self, result_data: str, document_id: str) -> str:
        blob_name = f"{document_id}/result.json"
        async with self._get_client_direct() as client:
            container_client = client.get_container_client(
                settings.AZURE_STORAGE_CONTAINER_RESULTS
            )
            await container_client.upload_blob(
                name=blob_name,
                data=result_data.encode("utf-8"),
                overwrite=True,
            )
        return blob_name

    async def download_document(self, blob_name: str) -> bytes:
        async with self._get_client_direct() as client:
            blob_client = client.get_blob_client(
                container=settings.AZURE_STORAGE_CONTAINER_DOCUMENTS,
                blob=blob_name,
            )
            stream = await blob_client.download_blob()
            return await stream.readall()