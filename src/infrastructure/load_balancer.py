"""Load Balancer and API Gateway Configuration.

Provides advanced load balancing, rate limiting, and request routing
for the distributed indigenous knowledge research platform.
"""

import logging
from typing import Dict, List, Optional, Callable, Any
import asyncio
import time
import uuid
from functools import wraps

import uvicorn
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from ..infrastructure.distributed_processing import DistributedProcessingManager

logger = logging.getLogger(__name__)

class RateLimiter:
    """Implements a distributed rate limiting mechanism."""
    
    def __init__(
        self, 
        max_requests: int = 100, 
        window_seconds: int = 60,
        distributed_manager: Optional[DistributedProcessingManager] = None
    ):
        """Initialize rate limiter.
        
        Args:
            max_requests: Maximum requests per time window
            window_seconds: Time window for rate limiting
            distributed_manager: Optional distributed processing manager
        """
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.distributed_manager = distributed_manager
        
        # Request tracking
        self.request_counts = {}
    
    async def __call__(self, request: Request, call_next: Callable):
        """Rate limiting middleware."""
        client_ip = request.client.host
        current_time = time.time()
        
        # Clean up old request records
        self.request_counts = {
            ip: counts for ip, counts in self.request_counts.items()
            if current_time - counts['timestamp'] < self.window_seconds
        }
        
        # Check rate limit
        if client_ip in self.request_counts:
            if (current_time - self.request_counts[client_ip]['timestamp'] < self.window_seconds and
                self.request_counts[client_ip]['count'] >= self.max_requests):
                raise HTTPException(
                    status_code=429, 
                    detail="Too many requests. Please try again later."
                )
            
            # Update request count
            if current_time - self.request_counts[client_ip]['timestamp'] >= self.window_seconds:
                self.request_counts[client_ip] = {
                    'count': 1,
                    'timestamp': current_time
                }
            else:
                self.request_counts[client_ip]['count'] += 1
        else:
            # First request for this IP
            self.request_counts[client_ip] = {
                'count': 1,
                'timestamp': current_time
            }
        
        # Continue request processing
        response = await call_next(request)
        return response

class RequestTracker:
    """Tracks and logs API requests for monitoring and analytics."""
    
    def __init__(self, distributed_manager: Optional[DistributedProcessingManager] = None):
        """Initialize request tracker.
        
        Args:
            distributed_manager: Optional distributed processing manager
        """
        self.distributed_manager = distributed_manager
        self.request_log = {}
    
    async def __call__(self, request: Request, call_next: Callable):
        """Request tracking middleware."""
        request_id = str(uuid.uuid4())
        request_time = time.time()
        
        # Log request details
        request_info = {
            'id': request_id,
            'method': request.method,
            'path': request.url.path,
            'client_ip': request.client.host,
            'timestamp': request_time,
            'status': None
        }
        
        try:
            response = await call_next(request)
            request_info['status'] = response.status_code
            
            # Log request details
            self.request_log[request_id] = request_info
            
            return response
        
        except Exception as e:
            request_info['status'] = 500
            request_info['error'] = str(e)
            self.request_log[request_id] = request_info
            raise

class APIGateway:
    """Configures and manages the API gateway with advanced features."""
    
    def __init__(
        self, 
        processing_mode: str = 'local',
        kubernetes_config: Optional[Dict] = None,
        rate_limit_config: Optional[Dict] = None,
        security_config: Optional[Dict] = None
    ):
        """Initialize API gateway with enhanced configuration.
        
        Args:
            processing_mode: Processing mode for distributed computing
            kubernetes_config: Optional Kubernetes configuration
            rate_limit_config: Custom rate limiting configuration
            security_config: Security and access control configuration
        """
        # Initialize distributed processing
        self.distributed_manager = DistributedProcessingManager(
            processing_mode=processing_mode,
            kubernetes_config=kubernetes_config
        )
        
        # Create FastAPI app
        self.app = FastAPI(
            title="Indigenous Knowledge Research Platform",
            description="Distributed platform for indigenous knowledge validation and research",
            version="1.0.0"
        )
        
        # Configure middleware with enhanced options
        self._configure_middleware(
            rate_limit_config=rate_limit_config or {},
            security_config=security_config or {}
        )
        
        # Rate limiter and request tracker with configurable parameters
        self.rate_limiter = RateLimiter(
            max_requests=rate_limit_config.get('max_requests', 100), 
            window_seconds=rate_limit_config.get('window_seconds', 60),
            distributed_manager=self.distributed_manager
        )
        self.request_tracker = RequestTracker(
            distributed_manager=self.distributed_manager
        )
    
    def _configure_middleware(
        self, 
        rate_limit_config: Dict, 
        security_config: Dict
    ):
        """Configure API middleware with enhanced security and rate limiting.
        
        Args:
            rate_limit_config: Rate limiting configuration
            security_config: Security configuration
        """
        # CORS middleware with configurable origins
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=security_config.get('allowed_origins', ["*"]),
            allow_credentials=security_config.get('allow_credentials', True),
            allow_methods=security_config.get('allowed_methods', ["*"]),
            allow_headers=security_config.get('allowed_headers', ["*"]),
        )
        
        # Trusted host middleware with configurable hosts
        self.app.add_middleware(
            TrustedHostMiddleware, 
            allowed_hosts=security_config.get('trusted_hosts', ["*"])
        )
        
        # Add rate limiter
        self.app.middleware("http")(self.rate_limiter)
        
        # Add request tracker
        self.app.middleware("http")(self.request_tracker)
    
    def add_route(
        self, 
        path: str, 
        endpoint: Callable, 
        methods: Optional[List[str]] = None
    ):
        """Add a route to the API gateway.
        
        Args:
            path: URL path for the route
            endpoint: Async function handling the route
            methods: HTTP methods allowed for the route
        """
        self.app.add_api_route(
            path=path, 
            endpoint=endpoint, 
            methods=methods or ["GET"]
        )
    
    async def process_request(
        self, 
        task_function: Callable, 
        task_args: List[Any],
        task_kwargs: Dict[str, Any],
        task_category: str = 'data_processing'
    ) -> Any:
        """Process a request using distributed computing.
        
        Args:
            task_function: Function to execute
            task_args: Positional arguments
            task_kwargs: Keyword arguments
            task_category: Resource allocation category
            
        Returns:
            Result of the distributed task
        """
        return await self.distributed_manager.distribute_task(
            task_function,
            task_args,
            task_kwargs,
            task_category
        )
    
    def get_cluster_status(self) -> Dict:
        """Get current distributed computing cluster status."""
        return self.distributed_manager.get_cluster_status()
    
    def run(
        self, 
        host: str = '0.0.0.0', 
        port: int = 8000, 
        workers: Optional[int] = None
    ):
        """Run the API gateway.
        
        Args:
            host: Binding host
            port: Binding port
            workers: Number of worker processes
        """
        uvicorn.run(
            self.app, 
            host=host, 
            port=port, 
            workers=workers or (os.cpu_count() * 2)
        ) 