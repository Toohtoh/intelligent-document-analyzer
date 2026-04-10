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

    # Azure Key Vault
    AZURE_KEYVAULT_URI: str

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()