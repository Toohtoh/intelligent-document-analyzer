from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Intelligent Document Analyzer"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"

    # Azure Blob Storage
    AZURE_STORAGE_ACCOUNT_NAME: str
    AZURE_STORAGE_CONTAINER_DOCUMENTS: str = "documents"
    AZURE_STORAGE_CONTAINER_RESULTS: str = "results"

    # Azure Cosmos DB
    AZURE_COSMOS_ENDPOINT: str
    AZURE_COSMOS_DATABASE: str = "documentanalyzer"
    AZURE_COSMOS_CONTAINER: str = "documents"

    # Azure Document Intelligence
    AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT: str

    # Azure OpenAI
    AZURE_OPENAI_ENDPOINT: str
    AZURE_OPENAI_DEPLOYMENT: str = "gpt-4o"

    # Optional API keys for local development (fallback from Managed Identity)
    AZURE_STORAGE_KEY: str = ""
    AZURE_COSMOS_KEY: str = ""
    AZURE_DOCUMENT_INTELLIGENCE_KEY: str = ""
    AZURE_OPENAI_KEY: str = ""

    # Azure Key Vault
    AZURE_KEYVAULT_URI: str

    # Auth0
    AUTH0_DOMAIN: str = "intelligent-docanalyzer.eu.auth0.com"
    AUTH0_AUDIENCE: str = "https://docanalyzer-api"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()