"""Distributed Processing Infrastructure.

Provides distributed computing capabilities for complex data processing tasks
using Dask and Kubernetes for scalable, fault-tolerant processing.
"""

import logging
from typing import Dict, List, Optional, Callable, Any, Union
from concurrent.futures import ThreadPoolExecutor, as_completed
import asyncio
import json
import os
import time

import dask
import dask.distributed
from dask.distributed import Client, LocalCluster, Future
import kubernetes
from kubernetes import client, config
# Attempt to import KubeCluster and handle if not available
try:
    from dask_kubernetes import KubeCluster
except ImportError:
    KubeCluster = None # type: ignore

logger = logging.getLogger(__name__)

class DistributedProcessingManager:
    """Manages distributed computing resources and task distribution."""
    
    def __init__(
        self, 
        processing_mode: str = 'local', 
        kubernetes_config: Optional[Dict] = None
    ):
        """Initialize distributed processing infrastructure.
        
        Args:
            processing_mode: 'local', 'kubernetes', or 'hybrid'
            kubernetes_config: Configuration for Kubernetes cluster
        """
        self.processing_mode = processing_mode
        self.kubernetes_config = kubernetes_config or {}
        self.client: Optional[dask.distributed.Client] = None
        self.cluster: Optional[Union[dask.distributed.LocalCluster, 'KubeCluster']] = None # More specific type
        
        # Resource allocation settings
        self.resource_allocation = {
            'data_processing': {
                'cpu_limit': os.getenv('DATA_PROCESSING_CPU_LIMIT', '4'),
                'memory_limit': os.getenv('DATA_PROCESSING_MEMORY_LIMIT', '16GB')
            },
            'validation': {
                'cpu_limit': os.getenv('VALIDATION_CPU_LIMIT', '2'),
                'memory_limit': os.getenv('VALIDATION_MEMORY_LIMIT', '8GB')
            },
            'machine_learning': {
                'cpu_limit': os.getenv('ML_CPU_LIMIT', '8'),
                'memory_limit': os.getenv('ML_MEMORY_LIMIT', '32GB')
            }
        }
    
    async def startup(self):
        """Initialize the Dask client and cluster based on processing mode."""
        if self.client is not None:
            logger.info("Dask client already initialized.")
            return

        logger.info(f"Starting Dask client in {self.processing_mode} mode...")
        max_retries = 3
        for attempt in range(max_retries):
            try:
                if self.processing_mode == 'local':
                    self.cluster = self._setup_local_cluster()
                    if not self.cluster: # Ensure cluster was created
                        logger.error("Local cluster setup failed. Cannot initialize client.")
                        raise RuntimeError("Failed to setup local Dask cluster.") 
                    # Initialize synchronously
                    self.client = dask.distributed.Client(self.cluster)
                    logger.info(f"DEBUG: self.client type after sync init: {type(self.client)}")
                    logger.info(f"DEBUG: self.client dir after sync init: {dir(self.client)}")
                    # No await self.client.ready() needed for synchronous client
                    logger.info(f"Dask LocalCluster started and client connected: {self.client.dashboard_link if self.client else 'N/A'}")
                    break
                
                elif self.processing_mode == 'kubernetes':
                    if KubeCluster is None:
                        logger.error("dask-kubernetes library is not installed. Cannot use 'kubernetes' processing mode.")
                        logger.warning("Falling back to local processing mode for Dask startup.")
                        self.processing_mode = 'local'
                        continue # Retry with local mode

                    self.cluster = self._setup_kubernetes_cluster()
                    if self.cluster:
                        # Initialize synchronously
                        self.client = dask.distributed.Client(self.cluster)
                        logger.info(f"DEBUG: self.client type after sync init: {type(self.client)}")
                        logger.info(f"DEBUG: self.client dir after sync init: {dir(self.client)}")
                        # No await self.client.ready() needed for synchronous client
                        logger.info(f"Dask Kubernetes client connected: {self.client.dashboard_link if self.client else 'N/A'}")
                        break
                    else:
                        logger.warning("Kubernetes cluster setup failed. Attempting fallback to local mode.")
                        self.processing_mode = 'local'
                        continue
                
                elif self.processing_mode == 'hybrid':
                    if KubeCluster is None:
                        logger.warning("dask-kubernetes is not installed. Hybrid mode will default to local cluster.")
                        # Fallback to local directly within the hybrid attempt or re-classify and retry
                        self.processing_mode = 'local' 
                        continue # Retry as local mode

                    self.cluster = self._setup_hybrid_cluster()
                    if self.cluster:
                        # Initialize synchronously
                        self.client = dask.distributed.Client(self.cluster)
                        logger.info(f"DEBUG: self.client type after sync init: {type(self.client)}")
                        logger.info(f"DEBUG: self.client dir after sync init: {dir(self.client)}")
                        # No await self.client.ready() needed for synchronous client
                        dashboard_link = getattr(self.client, 'dashboard_link', 'N/A')
                        if isinstance(self.cluster, KubeCluster):
                            logger.info(f"Dask Hybrid (Kubernetes part) client connected: {dashboard_link}")
                        else:
                            logger.info(f"Dask Hybrid (Local part/fallback) client connected: {dashboard_link}")
                        break
                    else:
                        logger.warning("Hybrid cluster setup failed. Attempting fallback to local mode.")
                        self.processing_mode = 'local'
                        continue
                
                else:
                    logger.error(f"Invalid processing mode for startup: {self.processing_mode}")
                    self.processing_mode = 'local'
                    logger.warning("Falling back to local processing mode for Dask startup.")
                    continue

            except (dask.distributed.TimeoutError, asyncio.TimeoutError) as te:
                logger.warning(f"Dask client startup attempt {attempt + 1} timed out: {str(te)}")
                # Specific handling for timeouts, which are common
            except OSError as oe:
                 logger.warning(f"Dask client startup attempt {attempt + 1} failed with OSError (e.g. port in use): {str(oe)}")
                 # This can catch issues like dashboard port conflicts if they bubble up before LocalCluster handles them
            except Exception as e:
                logger.warning(f"Dask client startup attempt {attempt + 1} failed with an unexpected error: {type(e).__name__}: {str(e)}", exc_info=True)
            
            # Cleanup before next retry or failure
            if self.client:
                try:
                    await self.client.close() # Ensure client is closed on failed startup
                except Exception as ce_client:
                    logger.error(f"Error closing Dask client during startup failure: {ce_client}")
                self.client = None # Reset client
            
            if self.cluster:
                try:
                    # Use the cluster's close method, checking if it's async
                    if hasattr(self.cluster, 'close') and asyncio.iscoroutinefunction(self.cluster.close): # type: ignore
                        await self.cluster.close() # type: ignore
                    elif hasattr(self.cluster, 'close'): # Synchronous close
                        self.cluster.close() # type: ignore
                except Exception as ce_cluster:
                    logger.error(f"Error closing Dask cluster during startup failure: {ce_cluster}")
                self.cluster = None # Reset cluster
                
            if attempt == max_retries - 1:
                logger.error("All Dask client startup attempts failed. Dask will be unavailable.")
                break
            
            await asyncio.sleep(2 ** attempt) # Exponential backoff

    async def shutdown(self):
        """Close the Dask client and cluster."""
        logger.info("Shutting down Dask client and cluster...")
        if self.client:
            try:
                await self.client.close()
                logger.info("Dask client closed.")
            except Exception as e:
                logger.error(f"Error closing Dask client: {e}")
            finally:
                self.client = None
        
        if self.cluster:
            try:
                # Check if cluster has an async close method
                if hasattr(self.cluster, 'close') and asyncio.iscoroutinefunction(self.cluster.close): # type: ignore
                    await self.cluster.close() # type: ignore
                elif hasattr(self.cluster, 'close'): # Synchronous close
                    self.cluster.close() # type: ignore
                logger.info("Dask cluster closed.")
            except Exception as e:
                logger.error(f"Error closing Dask cluster: {e}")
            finally:
                self.cluster = None
        logger.info("Dask shutdown complete.")

    def _initialize_client(self) -> Any: # This method is now effectively replaced by startup()
        """DEPRECATED: Initialize distributed computing client based on processing mode."""
        # This logic is moved to startup() and adapted for async
        # Kept for reference during refactor, should be removed or marked clearly deprecated.
        logger.warning("_initialize_client is deprecated and should not be called directly. Use startup().")
        # For safety, make it do nothing or raise an error if called.
        # raise NotImplementedError("_initialize_client is deprecated. Call startup() instead.")
        return None # Or simply remove this method
    
    def _setup_local_cluster(self) -> dask.distributed.LocalCluster:
        """Set up a local Dask cluster for multi-core processing."""
        logger.info("Setting up local Dask cluster...")
        cluster = LocalCluster(
            n_workers=os.cpu_count(),
            threads_per_worker=2,
            memory_limit='auto',
            dashboard_address=':0'  # Dynamically assign dashboard port
        )
        logger.info(f"LocalCluster initialized: {cluster}")
        return cluster
    
    def _setup_kubernetes_cluster(self) -> Optional['KubeCluster']:
        """Set up Dask cluster on Kubernetes."""
        if KubeCluster is None:
            logger.error("Cannot set up Kubernetes cluster: dask_kubernetes is not installed.")
            return None
        try:
            logger.info("Setting up Dask Kubernetes cluster...")
            try:
                    config.load_kube_config()
            except config.ConfigException:
                logger.info("Kube config not found locally, trying in-cluster config.")
                try:
                    config.load_incluster_config()
                except config.ConfigException as e:
                    logger.error(f"Failed to load Kubernetes configuration (local and in-cluster): {e}")
                    return None
            
            cluster = KubeCluster(
                name='nis-dask-cluster',
                n_workers=self.kubernetes_config.get('worker_count', 2),
                resources={
                    'requests': {
                        'cpu': self.kubernetes_config.get('worker_cpu_request', '0.5'),
                        'memory': self.kubernetes_config.get('worker_memory_request', '2Gi')
                    },
                    'limits': {
                        'cpu': self.kubernetes_config.get('worker_cpu_limit', '1'),
                        'memory': self.kubernetes_config.get('worker_memory_limit', '4Gi')
                    }
                },
            )
            # KubeCluster object might not have dashboard_link immediately or if it fails to connect to k8s API properly.
            # Access it safely.
            dashboard_link = getattr(cluster, 'dashboard_link', 'N/A')
            logger.info(f"KubeCluster object initialized: {cluster}, dashboard link: {dashboard_link}")
            return cluster
        
        except Exception as e:
            logger.error(f"Kubernetes cluster setup failed: {str(e)}", exc_info=True)
            return None # Indicate failure
    
    def _setup_hybrid_cluster(self) -> Optional[Union[dask.distributed.LocalCluster, 'KubeCluster']]:
        """Set up a hybrid cluster. Prefers Kubernetes, falls back to local."""
        if KubeCluster is None:
            logger.warning("dask_kubernetes is not installed. Hybrid mode will default to local cluster.")
            return self._setup_local_cluster()
    
        logger.info("Attempting to set up Kubernetes part of the hybrid cluster...")
        # Try to set up Kube part using the existing method which returns a KubeCluster object or None
        kube_cluster_part = self._setup_kubernetes_cluster() 

        if kube_cluster_part:
            logger.info("Hybrid setup: Kubernetes cluster part successfully initialized. Using KubeCluster for hybrid mode.")
            return kube_cluster_part
        else:
            logger.warning("Hybrid setup: Kubernetes part failed. Falling back to a local cluster for hybrid mode.")
            return self._setup_local_cluster()
    
    async def distribute_task(
        self,
        task_function: Callable,
        task_args: List[Any],
        task_kwargs: Dict[str, Any],
        task_category: str = 'data_processing'
    ) -> Any:
        """Distribute a computational task across the cluster.
        
        Args:
            task_function: Function to execute
            task_args: Positional arguments for the function
            task_kwargs: Keyword arguments for the function
            task_category: Resource category for task allocation
            
        Returns:
            Result of the distributed task
        """
        try:
            # Allocate resources based on task category
            resources = self.resource_allocation.get(
                task_category, 
                self.resource_allocation['data_processing']
            )
            
            # Submit task to Dask cluster
            future = self.client.submit(
                task_function, 
                *task_args, 
                **task_kwargs,
                resources={
                    'CPU': float(resources['cpu_limit']),
                    'MEMORY': resources['memory_limit']
                }
            )
            
            # Wait for task completion
            result = await future
            
            return result
        
        except Exception as e:
            logger.error(f"Distributed task failed: {str(e)}")
            # Fallback to local execution
            return task_function(*task_args, **task_kwargs)
    
    async def map_tasks(
        self,
        task_function: Callable,
        task_list: List[Any],
        task_category: str = 'data_processing'
    ) -> List[Any]:
        """Distribute multiple tasks across the cluster.
        
        Args:
            task_function: Function to execute for each task
            task_list: List of tasks to process
            task_category: Resource category for task allocation
            
        Returns:
            List of results from distributed tasks
        """
        try:
            # Allocate resources based on task category
            resources = self.resource_allocation.get(
                task_category, 
                self.resource_allocation['data_processing']
            )
            
            # Submit tasks to Dask cluster
            futures = [
                self.client.submit(
                    task_function, 
                    task,
                    resources={
                        'CPU': float(resources['cpu_limit']),
                        'MEMORY': resources['memory_limit']
                    }
                ) for task in task_list
            ]
            
            # Wait for all tasks to complete
            results = await self.client.gather(futures)
            
            return results
        
        except Exception as e:
            logger.error(f"Distributed task mapping failed: {str(e)}")
            # Fallback to sequential execution
            return [task_function(task) for task in task_list]
    
    def get_cluster_status(self) -> Dict:
        """Get the status of the Dask cluster."""
        if self.client and self.client.cluster and hasattr(self.client, 'scheduler_info'):
            try:
                # Ensure client is not closed before accessing scheduler_info
                if self.client.status in ('running', 'connecting'):
                    info = self.client.scheduler_info()
                    return {
                        "status": "running",
                        "scheduler_address": self.client.scheduler.address if self.client.scheduler else 'N/A',
                        "dashboard_link": self.client.dashboard_link,
                        "workers": len(info.get("workers", {})),
                        "threads": sum(w.get("nthreads", 0) for w in info.get("workers", {}).values()),
                        "memory_limit": sum(w.get("memory_limit", 0) for w in info.get("workers", {}).values()),
                    }
                else:
                    logger.warning(f"Dask client status is '{self.client.status}', cannot get scheduler info.")
                    return {"status": self.client.status, "workers": 0}
            except Exception as e:
                logger.error(f"Error getting Dask cluster status: {e}")
                return {"status": "error_getting_status", "workers": 0, "error": str(e)}
        else:
            logger.warning("Dask client or cluster not initialized, cannot get status.")
            return {"status": "not_initialized", "workers": 0}
    
    # Remove __del__ as explicit shutdown is preferred
    # def __del__(self):
    #     """Ensure resources are cleaned up on deletion."""
    #     if self.client:
    #         self.client.close()
    #     if hasattr(self, 'cluster') and self.cluster: # Check if cluster attribute exists
    #         self.cluster.close() 