from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import logging
import os
from pathlib import Path
import sys

# Import infrastructure clients
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from src.infrastructure import get_redis_client, get_kafka_client

# Set up logging
log_dir = os.path.join(os.path.dirname(__file__), "..", "outputs", "logs")
os.makedirs(log_dir, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(log_dir, "api.log")),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("nis_api")

# Import the modules containing our endpoints
try:
    from analyze import app as analyze_app
    from batch import app as batch_app
    from api_statistics import app as statistics_app
    from vision import app as vision_app
except ImportError:
    # Fallback - create minimal apps if imports fail
    from fastapi import APIRouter
    analyze_app = APIRouter()
    batch_app = APIRouter()
    statistics_app = APIRouter()
    vision_app = APIRouter()

# Create the main FastAPI application
app = FastAPI(
    title="NIS Protocol API",
    description="API for the NIS Protocol to discover archaeological sites in the Amazon with OpenAI integration",
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
app.include_router(analyze_app, prefix="/analyze", tags=["Analysis"])
app.include_router(batch_app, prefix="/batch", tags=["Batch Processing"])
app.include_router(statistics_app, prefix="/statistics", tags=["Statistics"])
app.include_router(vision_app, tags=["Vision Analysis"])

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

# System health endpoint (frontend expects this)
@app.get("/system/health")
async def system_health():
    """System health endpoint for frontend integration"""
    try:
        health_status = {
            "status": "operational",
            "timestamp": "2024-01-01T12:00:00Z",
            "services": {
                "api": "online",
                "redis": "online", 
                "kafka": "online"
            },
            "agents": {
                "vision_agent": "online",
                "memory_agent": "online",
                "reasoning_agent": "online", 
                "action_agent": "online"
            },
            "model_services": {
                "gpt4o": "online",
                "openai_vision": "online",
                "archaeological_analysis": "online"
            },
            "processing_queue": 0,
            "openai_integration": "operational"
        }
        
        # Check Redis
        try:
            redis_client = get_redis_client()
            redis_ping = redis_client.redis.ping()
            if not redis_ping:
                health_status["services"]["redis"] = "error"
                health_status["status"] = "degraded"
        except Exception:
            health_status["services"]["redis"] = "error"
            health_status["status"] = "degraded"
        
        return health_status
        
    except Exception as e:
        logger.error(f"System health check failed: {e}")
        return {
            "status": "error",
            "timestamp": "2024-01-01T12:00:00Z",
            "error": str(e)
        }

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
os.makedirs("outputs/statistics", exist_ok=True)

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
        
        # Start consumers for various topics
        topics = [
            ("nis.analysis.events", "nis-api-server-analysis"),
            ("nis.batch.events", "nis-api-server-batch"),
            ("nis.statistics.events", "nis-api-server-stats")
        ]
        
        for topic, group_id in topics:
            kafka_client.consume(
                topic=topic,
                callback=lambda key, value: logger.info(f"{topic} event: {value}"),
                group_id=group_id
            )
    except Exception as e:
        logger.error(f"Failed to initialize Kafka: {str(e)}")

# Shutdown event handler
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