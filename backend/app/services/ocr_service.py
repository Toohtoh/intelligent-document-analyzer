from azure.ai.formrecognizer.aio import DocumentAnalysisClient
from azure.identity.aio import ManagedIdentityCredential
from app.config import get_settings

settings = get_settings()


class OCRService:
    def __init__(self):
        self.endpoint = settings.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT

    async def extract_text(self, file_bytes: bytes, content_type: str) -> dict:
        if settings.AZURE_DOCUMENT_INTELLIGENCE_KEY:
            from azure.core.credentials import AzureKeyCredential
            credential = AzureKeyCredential(settings.AZURE_DOCUMENT_INTELLIGENCE_KEY)
            client = DocumentAnalysisClient(
                endpoint=self.endpoint,
                credential=credential,
            )
            async with client:
                poller = await client.begin_analyze_document(
                    model_id="prebuilt-document",
                    document=file_bytes,
                )
                result = await poller.result()
        else:
            credential = ManagedIdentityCredential()
            async with credential:
                client = DocumentAnalysisClient(
                    endpoint=self.endpoint,
                    credential=credential,
                )
                async with client:
                    poller = await client.begin_analyze_document(
                        model_id="prebuilt-document",
                        document=file_bytes,
                    )
                    result = await poller.result()
        return self._parse_result(result)

    def _parse_result(self, result) -> dict:
        pages_text = []
        for page in result.pages:
            page_content = {
                "page_number": page.page_number,
                "width": page.width,
                "height": page.height,
                "lines": [line.content for line in page.lines] if page.lines else [],
            }
            pages_text.append(page_content)

        tables = []
        for table in result.tables:
            table_data = {
                "row_count": table.row_count,
                "column_count": table.column_count,
                "cells": [
                    {
                        "row_index": cell.row_index,
                        "column_index": cell.column_index,
                        "content": cell.content,
                    }
                    for cell in table.cells
                ],
            }
            tables.append(table_data)

        key_value_pairs = []
        if result.key_value_pairs:
            for kv in result.key_value_pairs:
                if kv.key and kv.value:
                    key_value_pairs.append({
                        "key": kv.key.content,
                        "value": kv.value.content,
                    })

        full_text = result.content if result.content else ""

        return {
            "full_text": full_text,
            "pages": pages_text,
            "page_count": len(result.pages),
            "tables": tables,
            "key_value_pairs": key_value_pairs,
            "word_count": len(full_text.split()) if full_text else 0,
        }