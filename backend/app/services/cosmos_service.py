from azure.cosmos.aio import CosmosClient
from azure.identity.aio import ManagedIdentityCredential
from app.config import get_settings
from datetime import datetime
import uuid

settings = get_settings()
DEFAULT_USER_ID = "default-user"


class CosmosService:
    def __init__(self):
        self.endpoint = settings.AZURE_COSMOS_ENDPOINT
        self.database_name = settings.AZURE_COSMOS_DATABASE
        self.container_name = settings.AZURE_COSMOS_CONTAINER

    def _get_client(self):
        if settings.AZURE_COSMOS_KEY:
            return CosmosClient(url=self.endpoint, credential=settings.AZURE_COSMOS_KEY)
        return CosmosClient(url=self.endpoint, credential=ManagedIdentityCredential())

    async def save_document(self, document: dict, user_id: str = DEFAULT_USER_ID) -> dict:
        async with self._get_client() as client:
            database = client.get_database_client(self.database_name)
            container = database.get_container_client(self.container_name)
            document["id"] = document.get("document_id", str(uuid.uuid4()))
            document["userId"] = user_id
            document["saved_at"] = datetime.utcnow().isoformat()
            result = await container.upsert_item(document)
            return result

    async def get_document(self, document_id: str, user_id: str = DEFAULT_USER_ID) -> dict:
        async with self._get_client() as client:
            database = client.get_database_client(self.database_name)
            container = database.get_container_client(self.container_name)
            item = await container.read_item(
                item=document_id,
                partition_key=user_id,
            )
            return item

    async def list_documents(self, user_id: str = DEFAULT_USER_ID, limit: int = 20) -> list:
        async with self._get_client() as client:
            database = client.get_database_client(self.database_name)
            container = database.get_container_client(self.container_name)
            query = (
                f"SELECT c.id, c.document_id, c.filename, c.original_filename, "
                f"c.content_type, c.size_bytes, c.status, c.uploaded_at, "
                f"c.saved_at, c.ai_result, c.ocr_result FROM c "
                f"WHERE c.userId = @userId "
                f"ORDER BY c.saved_at DESC OFFSET 0 LIMIT {limit}"
            )
            items = []
            async for item in container.query_items(
                query=query,
                parameters=[{"name": "@userId", "value": user_id}]
            ):
                items.append(item)
            return items

    async def delete_document(self, document_id: str, user_id: str = DEFAULT_USER_ID) -> bool:
        async with self._get_client() as client:
            database = client.get_database_client(self.database_name)
            container = database.get_container_client(self.container_name)
            for partition_key in [user_id, DEFAULT_USER_ID, document_id]:
                try:
                    await container.delete_item(
                        item=document_id,
                        partition_key=partition_key,
                    )
                    return True
                except Exception:
                    continue
            raise Exception("Document not found with any partition key")