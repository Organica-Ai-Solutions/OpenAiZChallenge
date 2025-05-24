"""Distributed Processing Infrastructure.

Provides distributed computing capabilities for complex data processing tasks
using Dask and Kubernetes for scalable, fault-tolerant processing.
"""

import logging
from typing import Dict, List, Optional, Callable, Any
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
        
        # Initialize processing client
        self.client = self._initialize_client()
        
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
    
    def _initialize_client(self) -> Any:
        """Initialize distributed computing client based on processing mode."""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                if self.processing_mode == 'local':
                    # Local multi-core processing
                    return self._setup_local_cluster()
                
                elif self.processing_mode == 'kubernetes':
                    # Kubernetes cluster processing
                    return self._setup_kubernetes_cluster()
                
                elif self.processing_mode == 'hybrid':
                    # Hybrid local and Kubernetes processing
                    return self._setup_hybrid_cluster()
                
                else:
                    raise ValueError(f"Invalid processing mode: {self.processing_mode}")
            
            except Exception as e:
                logger.warning(f"Distributed client initialization attempt {attempt + 1} failed: {str(e)}")
                
                if attempt == max_retries - 1:
                    logger.error("All distributed client initialization attempts failed. Falling back to local processing.")
                    return self._setup_local_cluster()
                
                # Add exponential backoff
                time.sleep(2 ** attempt)
    
    def _setup_local_cluster(self) -> dask.distributed.Client:
        """Set up a local Dask cluster for multi-core processing."""
        cluster = LocalCluster(
            n_workers=os.cpu_count(),
            threads_per_worker=2,
            memory_limit='auto'
        )
        return dask.distributed.Client(cluster)
    
    def _setup_kubernetes_cluster(self) -> dask.distributed.Client:
        """Set up Dask cluster on Kubernetes."""
        try:
            # Load Kubernetes configuration
            config.load_kube_config()
            
            # Create Dask Kubernetes cluster
            from dask_kubernetes import KubeCluster
            
            cluster = KubeCluster(
                n_workers=self.kubernetes_config.get('worker_count', 3),
                resources={
                    'requests': {
                        'cpu': '1',
                        'memory': '4Gi'
                    },
                    'limits': {
                        'cpu': '2',
                        'memory': '8Gi'
                    }
                }
            )
            
            return dask.distributed.Client(cluster)
        
        except Exception as e:
            logger.error(f"Kubernetes cluster setup failed: {str(e)}")
            return self._setup_local_cluster()
    
    def _setup_hybrid_cluster(self) -> dask.distributed.Client:
        """Set up a hybrid local and Kubernetes processing cluster."""
        try:
            # Load Kubernetes configuration
            config.load_kube_config()
            
            # Create hybrid cluster
            from dask_kubernetes import KubeCluster
            
            cluster = KubeCluster(
                n_workers=self.kubernetes_config.get('worker_count', 3),
                resources={
                    'requests': {
                        'cpu': '1',
                        'memory': '4Gi'
                    },
                    'limits': {
                        'cpu': '2',
                        'memory': '8Gi'
                    }
                }
            )
            
            # Add local workers
            local_workers = LocalCluster(
                n_workers=os.cpu_count() // 2,
                threads_per_worker=2,
                memory_limit='auto'
            )
            
            # Combine clusters
            cluster.extend(local_workers)
            
            return dask.distributed.Client(cluster)
        
        except Exception as e:
            logger.error(f"Hybrid cluster setup failed: {str(e)}")
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
        """Get current status of the distributed computing cluster.
        
        Returns:
            Cluster status information
        """
        try:
            scheduler_info = self.client.scheduler_info()
            workers_info = scheduler_info.get('workers', {})
            tasks_info = scheduler_info.get('tasks', [])

            return {
                'workers': len(workers_info),
                'total_cpu': sum(
                    worker['resources'].get('CPU', 0) 
                    for worker in workers_info.values()
                ),
                'total_memory': sum(
                    worker['resources'].get('MEMORY', 0) if isinstance(worker['resources'].get('MEMORY'), (int, float)) else 0
                    for worker in workers_info.values()
                ),
                'processing_mode': self.processing_mode,
                'task_queue_length': len(tasks_info)
            }
        except Exception as e:
            logger.error(f"Error retrieving cluster status: {str(e)}")
            return {
                'error': 'Could not retrieve cluster status',
                'processing_mode': self.processing_mode
            }
    
    def __del__(self):
        """Cleanup distributed resources."""
        try:
            if hasattr(self, 'client'):
                self.client.close()
        except Exception as e:
            logger.error(f"Error closing distributed client: {str(e)}") 