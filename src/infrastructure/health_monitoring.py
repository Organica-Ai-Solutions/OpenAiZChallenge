"""Health Monitoring and System Status Tracking.

Provides comprehensive health checks, system diagnostics, 
and performance monitoring for the Indigenous Knowledge Research Platform.
"""

import os
import time
import psutil
import platform
import logging
from typing import Dict, Any, Optional

import redis
import kafka
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel

# Import settings directly
from ..config import settings, get_config, get_environment
from ..infrastructure.distributed_processing import DistributedProcessingManager

logger = logging.getLogger(__name__)

class SystemHealth(BaseModel):
    """Comprehensive system health status."""
    status: str
    timestamp: float
    environment: str
    
    # System resources
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    
    # Service dependencies
    redis_status: bool
    kafka_status: bool
    processing_status: bool
    
    # Detailed diagnostics
    system_info: Dict[str, str]
    feature_flags: Dict[str, bool]

class HealthMonitor:
    """Centralized health monitoring and diagnostic system."""
    
    def __init__(self):
        """Initialize health monitoring system. Call startup() to initialize Dask."""
        # Distributed manager will be started in the startup method
        self.distributed_manager: Optional[DistributedProcessingManager] = None
        self.config_manager = get_config() # get_config() returns the ConfigManager instance

    async def startup(self):
        """Initialize long-running resources like DistributedProcessingManager."""
        logger.info("HealthMonitor starting up...")
        self.distributed_manager = DistributedProcessingManager() # Uses settings.PROCESSING_MODE
        try:
            await self.distributed_manager.startup()
            logger.info("HealthMonitor: DistributedProcessingManager started successfully.")
        except Exception as e:
            logger.error(f"HealthMonitor: Failed to start DistributedProcessingManager: {e}")
            # Decide if this is critical. For now, HealthMonitor will continue but processing checks will fail.
            # self.distributed_manager will exist but its client/cluster might be None.

    async def shutdown(self):
        """Clean up resources, like shutting down DistributedProcessingManager."""
        logger.info("HealthMonitor shutting down...")
        if self.distributed_manager:
            try:
                await self.distributed_manager.shutdown()
                logger.info("HealthMonitor: DistributedProcessingManager shut down successfully.")
            except Exception as e:
                logger.error(f"HealthMonitor: Error shutting down DistributedProcessingManager: {e}")
        self.distributed_manager = None

    def check_redis_health(self) -> bool:
        """Check Redis connection health."""
        try:
            # Use global settings for Redis connection
            redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=settings.REDIS_DB,
                socket_timeout=2
            )
            redis_client.ping()
            return True
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            return False
    
    def check_kafka_health(self) -> bool:
        """Check Kafka broker health."""
        try:
            # Use global settings for Kafka connection
            kafka_client = kafka.KafkaConsumer(
                bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
                request_timeout_ms=2000
            )
            kafka_client.topics()  # Attempt to list topics
            return True
        except Exception as e:
            logger.error(f"Kafka health check failed: {e}")
            return False
    
    def get_system_resources(self) -> Dict[str, float]:
        """Retrieve current system resource utilization."""
        return {
            "cpu_usage": psutil.cpu_percent(),
            "memory_usage": psutil.virtual_memory().percent,
            "disk_usage": psutil.disk_usage('/').percent
        }
    
    def get_system_info(self) -> Dict[str, str]:
        """Collect detailed system information."""
        return {
            "os": platform.system(),
            "os_version": platform.version(),
            "python_version": platform.python_version(),
            "processor": platform.processor(),
            "machine": platform.machine()
        }
    
    def check_processing_health(self) -> bool:
        """Check distributed processing system health."""
        if not self.distributed_manager or not self.distributed_manager.client:
            logger.warning("Processing health check: DistributedProcessingManager or Dask client not available.")
            return False
        try:
            cluster_status = self.distributed_manager.get_cluster_status()
            # Check if status is 'running' and there's at least one worker
            return cluster_status.get('status') == 'running' and cluster_status.get('workers', 0) > 0
        except Exception as e:
            logger.error(f"Processing health check failed: {e}")
            return False
    
    def generate_health_report(self) -> SystemHealth:
        """Generate comprehensive system health report."""
        # Restore psutil and platform calls, assuming they are not the primary issue now
        resources = self.get_system_resources()
        
        current_feature_flags = {
            "distributed_processing": getattr(settings, 'DISTRIBUTED_PROCESSING_ENABLED', False), 
            "caching": getattr(settings, 'CACHING_ENABLED', True), 
            "event_logging": getattr(settings, 'EVENT_LOGGING_ENABLED', True), 
            "performance_tracking": getattr(settings, 'PERFORMANCE_TRACKING_ENABLED', True), 
            "gpt_vision": settings.ENABLE_GPT_VISION,
            "web_search": settings.ENABLE_WEB_SEARCH
        }

        redis_ok = self.check_redis_health()
        kafka_ok = self.check_kafka_health() # Restore Kafka check
        processing_ok = self.check_processing_health() # Restore processing check

        return SystemHealth(
            status="healthy" if all([
                redis_ok,
                kafka_ok, 
                processing_ok 
            ]) else "degraded",
            timestamp=time.time(),
            environment=get_environment().name,
            
            cpu_usage=resources['cpu_usage'],
            memory_usage=resources['memory_usage'],
            disk_usage=resources['disk_usage'],
            
            redis_status=redis_ok,
            kafka_status=kafka_ok, 
            processing_status=processing_ok, 
            
            system_info=self.get_system_info(), # Restore platform calls
            feature_flags=current_feature_flags
        )

def create_health_router() -> APIRouter:
    """Create FastAPI router for health checks.
       HealthMonitor instance is expected to be in request.app.state.health_monitor.
    """
    router = APIRouter()
    
    # Dependency to get HealthMonitor from app.state
    async def get_health_monitor(request: Request) -> HealthMonitor:
        if not hasattr(request.app.state, 'health_monitor') or request.app.state.health_monitor is None:
            logger.error("HealthMonitor not found in app.state. Check lifespan initialization.")
            raise HTTPException(status_code=500, detail="HealthMonitor not initialized")
        return request.app.state.health_monitor

    @router.get("/health", response_model=SystemHealth)
    async def health_check(health_monitor: HealthMonitor = Depends(get_health_monitor)):
        """Comprehensive system health check endpoint."""
        try:
            health_report = health_monitor.generate_health_report()
            if health_report.status == "healthy":
                return health_report
            else:
                raise HTTPException(
                    status_code=503, 
                    detail="Service Unavailable: System is in a degraded state"
                )
        except Exception as e:
            logger.error(f"Health check failed: {e}", exc_info=True) # Add exc_info for more details
            raise HTTPException(
                status_code=500, 
                detail="Internal Server Error during health check"
            )
    
    @router.get("/diagnostics")
    async def system_diagnostics(health_monitor: HealthMonitor = Depends(get_health_monitor)):
        """Detailed system diagnostics endpoint."""
        try:
            health_report = health_monitor.generate_health_report()
            return {
                "health_report": health_report.dict(),
                "detailed_system_info": health_monitor.get_system_info(),
                "resource_usage": health_monitor.get_system_resources()
            }
        except Exception as e:
            logger.error(f"Diagnostics retrieval failed: {e}", exc_info=True) # Add exc_info
            raise HTTPException(
                status_code=500, 
                detail="Could not retrieve system diagnostics"
            )
    
    return router 