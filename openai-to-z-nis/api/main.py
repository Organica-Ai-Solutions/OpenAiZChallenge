from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import logging
import os
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("outputs/logs/api.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("nis_api")

# Import the analyze module containing our endpoints
from .analyze import app as analyze_app

# Create the main FastAPI application
app = FastAPI(
    title="NIS Protocol API",
    description="API for the NIS Protocol to discover archaeological sites in the Amazon",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers from other modules
app.include_router(analyze_app, prefix="")

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to the NIS Protocol API"}

# Health check endpoint
@app.get("/health")
async def health():
    return {"status": "healthy"}

# Exception handlers
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."}
    )

# Mount static files if they exist
static_dir = Path("static")
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Create necessary directories
os.makedirs("outputs/logs", exist_ok=True)
os.makedirs("outputs/findings", exist_ok=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True) 