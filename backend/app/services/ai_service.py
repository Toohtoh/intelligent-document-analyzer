from openai import AsyncAzureOpenAI
from azure.identity.aio import ManagedIdentityCredential
from azure.core.credentials import AccessToken
from app.config import get_settings
import time

settings = get_settings()


class AIService:
    def __init__(self):
        self.endpoint = settings.AZURE_OPENAI_ENDPOINT
        self.deployment = settings.AZURE_OPENAI_DEPLOYMENT

    async def _get_client(self):
        """Create Azure OpenAI client with Managed Identity."""
        credential = ManagedIdentityCredential()
        token = await credential.get_token(
            "https://cognitiveservices.azure.com/.default"
        )
        await credential.close()

        client = AsyncAzureOpenAI(
            azure_endpoint=self.endpoint,
            azure_deployment=self.deployment,
            api_version="2024-02-01",
            azure_ad_token=token.token,
        )
        return client

    async def generate_summary(self, text: str) -> str:
        """
        Generate a concise summary of the document.
        """
        if not text or len(text.strip()) == 0:
            return "No text content to summarize."

        # Limit text to avoid token limits
        truncated_text = text[:8000] if len(text) > 8000 else text

        client = await self._get_client()

        response = await client.chat.completions.create(
            model=self.deployment,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert document analyst. "
                        "Your job is to produce clear, concise, and accurate summaries. "
                        "Always respond in the same language as the document."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Please provide a concise summary of the following document "
                        f"in 3-5 sentences. Focus on the main topic, key points, "
                        f"and any important conclusions:\n\n{truncated_text}"
                    ),
                },
            ],
            max_tokens=500,
            temperature=0.3,
        )

        return response.choices[0].message.content.strip()

    async def extract_entities(self, text: str) -> dict:
        """
        Extract key entities from the document:
        names, dates, amounts, organizations, locations.
        """
        if not text or len(text.strip()) == 0:
            return {}

        truncated_text = text[:8000] if len(text) > 8000 else text

        client = await self._get_client()

        response = await client.chat.completions.create(
            model=self.deployment,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert at extracting structured information "
                        "from documents. Always respond with valid JSON only. "
                        "No explanation, no markdown, just pure JSON."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Extract the following entities from the document and "
                        f"return them as a JSON object with these keys: "
                        f"'people' (list of person names), "
                        f"'organizations' (list of org names), "
                        f"'dates' (list of dates), "
                        f"'amounts' (list of monetary amounts), "
                        f"'locations' (list of places). "
                        f"If none found for a category, use an empty list.\n\n"
                        f"{truncated_text}"
                    ),
                },
            ],
            max_tokens=500,
            temperature=0.1,
        )

        import json
        try:
            raw = response.choices[0].message.content.strip()
            raw = raw.replace("```json", "").replace("```", "").strip()
            return json.loads(raw)
        except Exception:
            return {}

    async def answer_question(self, text: str, question: str) -> str:
        """
        Answer a question about the document content.
        """
        if not text or len(text.strip()) == 0:
            return "No document content available to answer questions."

        truncated_text = text[:8000] if len(text) > 8000 else text

        client = await self._get_client()

        response = await client.chat.completions.create(
            model=self.deployment,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful assistant that answers questions "
                        "strictly based on the provided document content. "
                        "If the answer is not in the document, say so clearly. "
                        "Always respond in the same language as the question."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Document content:\n{truncated_text}\n\n"
                        f"Question: {question}"
                    ),
                },
            ],
            max_tokens=500,
            temperature=0.3,
        )

        return response.choices[0].message.content.strip()