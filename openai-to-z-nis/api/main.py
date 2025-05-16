from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import logging
import os
from pathlib import Path

# Import infrastructure clients
from src.infrastructure import get_redis_client, get_kafka_client

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
    # Check Redis and Kafka connectivity
    health_status = {"status": "healthy", "services": {}}
    
    # Check Redis
    try:
        redis_client = get_redis_client()
        redis_ping = redis_client.redis.ping()
        health_status["services"]["redis"] = "connected" if redis_ping else "error"
    except Exception as e:
        logger.error(f"Redis health check failed: {str(e)}")
        health_status["services"]["redis"] = "error"
    
    # Check Kafka - this is a simplified check as true connectivity is hard to verify
    try:
        kafka_client = get_kafka_client()
        health_status["services"]["kafka"] = "connected"
    except Exception as e:
        logger.error(f"Kafka health check failed: {str(e)}")
        health_status["services"]["kafka"] = "error"
    
    # Update overall status
    if any(status == "error" for status in health_status["services"].values()):
        health_status["status"] = "degraded"
    
    return health_status

# Dependencies for services
def get_redis():
    try:
        return get_redis_client()
    except Exception as e:
        logger.error(f"Failed to get Redis client: {str(e)}")
        raise HTTPException(status_code=503, detail="Redis service unavailable")

def get_kafka():
    try:
        return get_kafka_client()
    except Exception as e:
        logger.error(f"Failed to get Kafka client: {str(e)}")
        raise HTTPException(status_code=503, detail="Kafka service unavailable")

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

# Initialize infrastructure on startup
@app.on_event("startup")
async def startup_event():
    logger.info("API server starting up")
    
    # Initialize Redis
    try:
        redis_client = get_redis_client()
        logger.info("Redis client initialized")
    except Exception as e:
        logger.error(f"Failed to initialize Redis: {str(e)}")
    
    # Initialize Kafka
    try:
        kafka_client = get_kafka_client()
        logger.info("Kafka client initialized")
        
        # Start a consumer for analysis events
        kafka_client.consume(
            topic="nis.analysis.events",
            callback=lambda key, value: logger.info(f"Analysis event: {value}"),
            group_id="nis-api-server"
        )
    except Exception as e:
        logger.error(f"Failed to initialize Kafka: {str(e)}")

# Cleanup on shutdown
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("API server shutting down")
    
    # Close Redis
    try:
        redis_client = get_redis_client()
        redis_client.close()
        logger.info("Redis connection closed")
    except Exception as e:
        logger.error(f"Error closing Redis connection: {str(e)}")
    
    # Close Kafka
    try:
        kafka_client = get_kafka_client()
        kafka_client.close()
        logger.info("Kafka connection closed")
    except Exception as e:
        logger.error(f"Error closing Kafka connection: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True) 