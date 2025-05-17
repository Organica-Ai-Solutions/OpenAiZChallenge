import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from .api.auth import router as auth_router
from .api.research import router as research_router
from .api.agents import router as agents_router

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
        title="Indigenous Knowledge Research Platform",
        description="A distributed platform for validating and processing indigenous knowledge",
        version="0.1.0"
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allows all origins
        allow_credentials=True,
        allow_methods=["*"],  # Allows all methods
        allow_headers=["*"],  # Allows all headers
    )

    # Include routers
    app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
    app.include_router(research_router, prefix="/research", tags=["Research"])
    app.include_router(agents_router, prefix="/agents", tags=["Agents"])

    return app

app = create_application()

@app.on_event("startup")
async def startup_event():
    """
    Startup event handler for initializing resources.
    """
    logger.info("Starting Indigenous Knowledge Research Platform")
    # Initialize any startup resources here
    # e.g., database connections, cache warmup, etc.

@app.on_event("shutdown")
async def shutdown_event():
    """
    Shutdown event handler for cleaning up resources.
    """
    logger.info("Shutting down Indigenous Knowledge Research Platform")
    # Perform any cleanup operations here

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 