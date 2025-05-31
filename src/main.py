"""Main Application Entrypoint for Indigenous Knowledge Research Platform.

Configures and launches the distributed research platform with 
comprehensive security, monitoring, and processing capabilities.
"""

import uvicorn
import logging # Keep for basicConfig
from fastapi import FastAPI, Depends, HTTPException, status, Request # Restore FastAPI import
from fastapi.middleware.cors import CORSMiddleware # Add this import
from contextlib import asynccontextmanager # Keep commented for now
from typing import Optional, AsyncGenerator # Keep commented for now
import os # Restore os import, often used with settings

# Configuration and Environment Management
from .config import (
    app_settings, # Use the global AppSettings instance
    config_manager, # Use the global ConfigManager instance
    Environment
)

# Infrastructure Components (Restoring this block)
from .infrastructure.load_balancer import APIGateway
from .infrastructure.auth_middleware import (
    AuthenticationManager, 
    RBACMiddleware
)
from .infrastructure.health_monitoring import create_health_router, HealthMonitor
from .infrastructure.redis_client import get_redis_client, RedisClient
from .infrastructure.kafka_client import get_kafka_client
from .infrastructure.database import init_db as initialize_database_tables, db_manager
from .infrastructure.distributed_processing import DistributedProcessingManager

# Processing Pipeline (Restoring this import)
from .data_processing.pipeline import AnalysisPipeline

# Monitoring (Restoring this import)
from .monitoring.statistics import StatisticsCollector

# MODIFIED: Import config_manager from src.config
# from src.config import config_manager as main_app_config_manager, get_settings # This line is effectively replaced by the above

# Configure logging properly AFTER settings are imported
logging.basicConfig(
    level=app_settings.LOG_LEVEL, # Use LOG_LEVEL from app_settings
    format=app_settings.logging_config.format, # Use format from nested LoggingConfig
    handlers=[
        logging.StreamHandler(), # Keep console output
        logging.FileHandler(os.path.join(app_settings.LOG_DIR, "app.log")) # Use LOG_DIR from app_settings
    ]
)
logger = logging.getLogger(__name__) # Re-initialize logger with new config

logger.info("--- LOGGER: src/main.py IS RUNNING ---")

@asynccontextmanager
async def lifespan(app_param: FastAPI) -> AsyncGenerator[None, None]: # Renamed app to app_param to avoid conflict if uncommented early
    """Manage application lifespan events for resource initialization and cleanup."""
    logger.info("Application startup: Initializing resources...")
    
    # Initialize Redis client
    try:
        redis_client_instance = get_redis_client()
        app_param.state.redis = redis_client_instance
        logger.info("Redis client initialized and attached to app_param.state.redis")
    except Exception as e:
        logger.error(f"CRITICAL: Failed to initialize Redis: {e}", exc_info=True)
        app_param.state.redis = None # Ensure it's set even on failure

    # Initialize StatisticsCollector
    try:
        # stats_collector_instance = StatisticsCollector(redis_client=app_param.state.redis)
        # app_param.state.stats_collector = stats_collector_instance
        # logger.info("StatisticsCollector initialized and attached to app_param.state.stats_collector")
        # Commented out as per user's src/main.py, seems it was not uncommented yet
        pass # Placeholder if not uncommenting stats collector yet
    except Exception as e:
        # logger.error(f"CRITICAL: Failed to initialize StatisticsCollector: {e}", exc_info=True)
        # app_param.state.stats_collector = None
        pass

    # Initialize HealthMonitor and Dask
    # try:
    #     health_monitor_instance = HealthMonitor(
    #         redis_client=app_param.state.redis, 
    #         # kafka_client=app_param.state.kafka_producer # This would need kafka_producer to be initialized first
    #     )
    #     await health_monitor_instance.start_dask_client()
    #     app_param.state.health_monitor = health_monitor_instance
    #     app_param.state.dask_client = health_monitor_instance.dask_manager.get_client() # Store Dask client
    #     logger.info("HealthMonitor initialized and Dask started, attached to app_param.state")
    # except Exception as e:
    #     logger.error(f"CRITICAL: Failed to initialize HealthMonitor or Dask: {e}", exc_info=True)
    #     app_param.state.health_monitor = None
    #     app_param.state.dask_client = None
    # Commented out as per user's src/main.py

    # Initialize Kafka Client (Producer/Consumer Access)
    try:
        kafka_client_instance = get_kafka_client()
        # If KafkaClient has an async start method, uncomment below
        # await kafka_client_instance.start_producer()
        # await kafka_client_instance.start_consumers() # Or a general start method
        app_param.state.kafka_client = kafka_client_instance  # MODIFIED: Store as kafka_client
        logger.info("Kafka client (get_kafka_client) initialized and attached to app_param.state.kafka_client")
    except Exception as e:
        logger.error(f"CRITICAL: Failed to initialize Kafka client: {e}", exc_info=True)
        app_param.state.kafka_client = None # MODIFIED: Ensure it's set even on failure
    
    # Initialize AnalysisPipeline (Example, if needed application-wide)
    # try:
    #     pipeline_instance = AnalysisPipeline(
    #         redis_client=app_param.state.redis,
    #         kafka_producer=app_param.state.kafka_producer
    #     )
    #     app_param.state.analysis_pipeline = pipeline_instance
    #     logger.info("AnalysisPipeline initialized and attached to app_param.state.analysis_pipeline")
    # except Exception as e:
    #     logger.error(f"CRITICAL: Failed to initialize AnalysisPipeline: {e}", exc_info=True)
    #     app_param.state.analysis_pipeline = None
    # Commented out as per user's src/main.py

    # Initialize Dask Manager
    # try:
    #     dask_manager_instance = DaskManager(
    #         redis_client=app_param.state.redis,
    #         kafka_client=app_param.state.kafka_producer
    #     )
    #     app_param.state.dask_manager = dask_manager_instance
    #     logger.info("DaskManager initialized and attached to app_param.state.dask_manager")
    # except Exception as e:
    #     logger.error(f"CRITICAL: Failed to initialize DaskManager: {e}", exc_info=True)
    #     app_param.state.dask_manager = None
    # Commented out as per user's src/main.py

    yield # Application is ready to serve requests

    logger.info("Application shutdown: Cleaning up resources...")
    # if app_param.state.health_monitor:
    #     await app_param.state.health_monitor.shutdown_dask_client()
    #     logger.info("Dask client connection closed via HealthMonitor.")
    # Commented out as per user's src/main.py
        
    if hasattr(app_param.state, 'redis') and app_param.state.redis:
        try:
            await app_param.state.redis.close() # Ensure close is awaitable if redis client is async
            logger.info("Redis client connection closed.")
        except Exception as e:
            logger.error(f"Error closing Redis client: {e}", exc_info=True)
    
    if hasattr(app_param.state, 'kafka_client') and app_param.state.kafka_client: # Check attribute existence
        try:
            # If KafkaClient has async stop methods, uncomment below
            # await app_param.state.kafka_client.stop_producer()
            # await app_param.state.kafka_client.stop_consumers() # Or a general stop
            logger.info("Kafka client connections closed.")
        except Exception as e:
            logger.error(f"Error closing Kafka client connections: {e}", exc_info=True)

    # Close Dask client and cluster if HealthMonitor managed it
    if app_param.state.health_monitor and app_param.state.health_monitor.dask_manager:
        await app_param.state.health_monitor.dask_manager.close_dask()
        logger.info("Dask client and cluster shut down by HealthMonitor.")

    # Close Redis connection
    if app_param.state.redis:
        try:
            await app_param.state.redis.close() # Assumes RedisClient has an async close
            logger.info("Redis client connection closed.")
        except Exception as e:
            logger.error(f"Error closing Redis connection: {e}", exc_info=True)

    # Close Kafka client (producer/consumers)
    if app_param.state.kafka_client: # MODIFIED: Check for kafka_client
        try:
            # If KafkaClient has async stop methods, uncomment below
            # await app_param.state.kafka_client.stop_producer()
            # await app_param.state.kafka_client.stop_consumers() # Or a general stop
            logger.info("Kafka client connections closed.")
        except Exception as e:
            logger.error(f"Error closing Kafka client connections: {e}", exc_info=True)
            
    # Close database engine (if applicable, though usually managed by session context)
    # Example: if hasattr(app_param.state, 'db_engine') and app_param.state.db_engine:
    # await app_param.state.db_engine.dispose()
    # logger.info("Database engine disposed.")
    
    logger.info("Application shutdown complete.")

# Restore basic FastAPI app definition
app = FastAPI(
    title="NIS Backend",
    description="Indigenous Knowledge Research Platform Main API",
    version="0.1.0",
    lifespan=lifespan # Add lifespan here
) # Updated title and added lifespan
logger.info("--- LOGGER: FastAPI app object created (Stage 5 Test - Data/Monitor Imports) ---")


# All other imports and FastAPI app setup commented out for now

# # Infrastructure Components
# from .infrastructure.load_balancer import APIGateway
# from .infrastructure.auth_middleware import (
#     AuthenticationManager, 
#     RBACMiddleware
# )
# from .infrastructure.health_monitoring import create_health_router, HealthMonitor
# from .infrastructure.redis_client import get_redis_client, RedisClient

# # Processing Pipeline
# from .data_processing.pipeline import AnalysisPipeline

# # Monitoring
# from .monitoring.statistics import StatisticsCollector

# Import API routers
from api.analyze import app as analyze_router # Uncommented
from api.batch import app as batch_router # Uncomment
from api.statistics import app as statistics_router # Uncommented
from ikrp.src.api.research import router as research_router # Uncomment
from ikrp.src.api.agents import router as agents_router # Uncomment


# Configure CORS (Uncommented)
app.add_middleware(
    CORSMiddleware,
    allow_origins=app_settings.security.cors_allowed_origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add health monitoring routes
health_router_instance = create_health_router() 
app.include_router(health_router_instance, prefix="/system", tags=["System"])

# Include other API routers
app.include_router(analyze_router, prefix="", tags=["Analysis"]) # Uncommented
app.include_router(batch_router, prefix="/batch", tags=["Batch Processing"]) # Uncomment
app.include_router(statistics_router, prefix="", tags=["Statistics"]) # Uncommented
app.include_router(research_router, prefix="/research", tags=["IKRP Research"]) # Uncomment
app.include_router(agents_router, prefix="/agents", tags=["IKRP Agents"]) # Uncomment

# TODO: Setup AuthenticationManager and RBACMiddleware if needed and if they are async-compatible
# auth_manager = AuthenticationManager(secret_key=settings.SECRET_KEY)
# app.add_middleware(RBACMiddleware, permission_map=auth_manager.get_permission_map())

# Add the new debug endpoint
@app.get("/debug-config")
async def debug_config():
    """
    Temporary endpoint to display the live configuration dictionary from AppSettings.
    """
    if app_settings:
        # Use model_dump() for Pydantic v2, or dict() for Pydantic v1
        # Assuming pydantic_settings implies Pydantic v2+ features are available
        try:
            return app_settings.model_dump(mode='json') # serializable version
        except AttributeError:
            return app_settings.dict() # Fallback for older Pydantic
    else:
        return {"error": "AppSettings not found or not initialized."}

async def startup_event():
    logger.info("Running startup events...")
    # The import 'from .infrastructure.database import init_db as initialize_database_tables' is already correct.
    # The call to 'await initialize_database_tables()' is also correct.
    await initialize_database_tables()
    logger.info("Database tables initialization attempted.")
    # Any other startup tasks

@app.on_event("startup")
async def on_startup():
    await startup_event()

if __name__ == "__main__":
    logger.info("--- LOGGER: Starting server with uvicorn.run ---")
    print("--- PRINT: Starting server with uvicorn.run ---")
    try:
        uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
    except Exception as e: # Catch any exception during uvicorn.run
        logger.error(f"Uvicorn run failed: {e}", exc_info=True)
        print(f"Uvicorn run failed: {e}")