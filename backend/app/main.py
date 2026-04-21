from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import health, documents

settings = get_settings()

# ── Application Insights ──────────────────────────────────────────────────────
try:
    from opencensus.ext.azure.log_exporter import AzureLogHandler
    from opencensus.ext.azure.trace_exporter import AzureExporter
    from opencensus.trace.samplers import ProbabilitySampler
    from opencensus.ext.flask import FlaskMiddleware
    import logging

    APPINSIGHTS_KEY = settings.APPINSIGHTS_CONNECTION_STRING
    if APPINSIGHTS_KEY:
        logger = logging.getLogger(__name__)
        logger.addHandler(AzureLogHandler(
            connection_string=APPINSIGHTS_KEY
        ))
        logger.setLevel(logging.INFO)
        logger.info("Application Insights connected")
except Exception as e:
    print(f"App Insights not configured: {e}")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API for intelligent document analysis using Azure AI services",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(documents.router, prefix="/api/v1", tags=["Documents"])

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
    }