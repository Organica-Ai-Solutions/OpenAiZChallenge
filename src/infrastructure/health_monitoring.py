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
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..config import get_config, get_environment
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
    
    def __init__(
        self, 
        distributed_manager: Optional[DistributedProcessingManager] = None
    ):
        """Initialize health monitoring system."""
        self.distributed_manager = distributed_manager or DistributedProcessingManager()
        
        # Configuration
        self.database_config = get_config("database")
        self.feature_config = get_config("features")
    
    def check_redis_health(self) -> bool:
        """Check Redis connection health."""
        try:
            redis_client = redis.Redis(
                host=self.database_config.redis_host,
                port=self.database_config.redis_port,
                db=self.database_config.redis_db,
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
            kafka_client = kafka.KafkaConsumer(
                bootstrap_servers=self.database_config.kafka_bootstrap_servers,
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
        try:
            cluster_status = self.distributed_manager.get_cluster_status()
            return cluster_status.get('workers', 0) > 0
        except Exception as e:
            logger.error(f"Processing health check failed: {e}")
            return False
    
    def generate_health_report(self) -> SystemHealth:
        """Generate comprehensive system health report."""
        resources = self.get_system_resources()
        
        return SystemHealth(
            status="healthy" if all([
                self.check_redis_health(),
                self.check_kafka_health(),
                self.check_processing_health()
            ]) else "degraded",
            timestamp=time.time(),
            environment=get_environment().name,
            
            # Resource utilization
            cpu_usage=resources['cpu_usage'],
            memory_usage=resources['memory_usage'],
            disk_usage=resources['disk_usage'],
            
            # Service health
            redis_status=self.check_redis_health(),
            kafka_status=self.check_kafka_health(),
            processing_status=self.check_processing_health(),
            
            # System details
            system_info=self.get_system_info(),
            feature_flags={
                "distributed_processing": self.feature_config.enable_distributed_processing,
                "caching": self.feature_config.enable_caching,
                "event_logging": self.feature_config.enable_event_logging,
                "performance_tracking": self.feature_config.enable_performance_tracking
            }
        )

def create_health_router() -> APIRouter:
    """Create FastAPI router for health checks."""
    router = APIRouter()
    health_monitor = HealthMonitor()
    
    @router.get("/health", response_model=SystemHealth)
    async def health_check():
        """Comprehensive system health check endpoint."""
        try:
            health_report = health_monitor.generate_health_report()
            
            # Determine HTTP status based on overall health
            if health_report.status == "healthy":
                return health_report
            else:
                raise HTTPException(
                    status_code=503, 
                    detail="Service Unavailable: System is in a degraded state"
                )
        
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            raise HTTPException(
                status_code=500, 
                detail="Internal Server Error during health check"
            )
    
    @router.get("/diagnostics")
    async def system_diagnostics():
        """Detailed system diagnostics endpoint."""
        try:
            health_report = health_monitor.generate_health_report()
            return {
                "health_report": health_report.dict(),
                "detailed_system_info": health_monitor.get_system_info(),
                "resource_usage": health_monitor.get_system_resources()
            }
        
        except Exception as e:
            logger.error(f"Diagnostics retrieval failed: {e}")
            raise HTTPException(
                status_code=500, 
                detail="Could not retrieve system diagnostics"
            )
    
    return router 