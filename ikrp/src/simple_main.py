import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import only the codex router
from .api.codex import router as codex_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_application() -> FastAPI:
    """
    Create and configure the FastAPI application.
    
    Returns:
        FastAPI: Configured application instance
    """
    app = FastAPI(
        title="NIS Protocol Codex Discovery Service",
        description="Automated codex discovery and GPT-4.1 Vision analysis for archaeological research",
        version="1.0.0"
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allows all origins
        allow_credentials=True,
        allow_methods=["*"],  # Allows all methods
        allow_headers=["*"],  # Allows all headers
    )

    # Include only codex router
    app.include_router(codex_router, prefix="/codex", tags=["Codex Discovery"])

    return app

app = create_application()

@app.on_event("startup")
async def startup_event():
    """
    Startup event handler for initializing resources.
    """
    logger.info("🚀 Starting NIS Protocol Codex Discovery Service")
    logger.info("📜 Automated codex discovery enabled")
    logger.info("🔍 GPT-4.1 Vision integration active")

@app.on_event("shutdown")
async def shutdown_event():
    """
    Shutdown event handler for cleaning up resources.
    """
    logger.info("Shutting down NIS Protocol Codex Discovery Service")

@app.get("/")
async def root():
    """Root endpoint with system information."""
    return {
        "message": "NIS Protocol Codex Discovery Service",
        "version": "1.0.0",
        "features": [
            "Automated codex discovery",
            "GPT-4.1 Vision analysis",
            "Historical document integration",
            "Multi-archive search"
        ],
        "codex_sources": ["FAMSI", "World Digital Library", "INAH"],
        "status": "operational"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 