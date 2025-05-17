"""Optimized LIDAR data processing module."""

import numpy as np
from typing import Dict, List, Optional, Tuple, Union
import logging
from pathlib import Path
import laspy
import dask.array as da
from dask.distributed import Client, LocalCluster
from scipy.spatial import cKDTree
import pandas as pd
from concurrent.futures import ThreadPoolExecutor
import json

from .image_processor import ImageProcessor

logger = logging.getLogger(__name__)

class LidarProcessor:
    """Optimized processor for large LIDAR datasets."""
    
    def __init__(
        self,
        chunk_size: int = 1_000_000,  # points per chunk
        n_workers: int = 4,
        memory_limit: str = '4GB'
    ):
        """Initialize the LIDAR processor.
        
        Args:
            chunk_size: Number of points to process per chunk
            n_workers: Number of parallel workers
            memory_limit: Memory limit per worker
        """
        self.chunk_size = chunk_size
        self.n_workers = n_workers
        self.memory_limit = memory_limit
        self.image_processor = ImageProcessor()
        
        # Initialize Dask cluster for distributed processing
        self.cluster = LocalCluster(
            n_workers=n_workers,
            threads_per_worker=2,
            memory_limit=memory_limit
        )
        self.client = Client(self.cluster)
        logger.info(f"Initialized Dask cluster with {n_workers} workers")
    
    def process_file(
        self,
        filepath: Path,
        output_dir: Optional[Path] = None,
        resolution: float = 1.0  # meters per pixel
    ) -> Dict:
        """Process a large LIDAR file with optimized memory usage.
        
        Args:
            filepath: Path to the LAS/LAZ file
            output_dir: Directory to save outputs
            resolution: Output resolution in meters
            
        Returns:
            Dictionary containing processing results
        """
        try:
            # Create output directory if needed
            if output_dir:
                output_dir.mkdir(parents=True, exist_ok=True)
            
            # Read LIDAR file metadata
            metadata = self._read_metadata(filepath)
            
            # Process file in chunks
            chunks = self._chunk_file(filepath)
            results = []
            
            # Process each chunk in parallel
            futures = []
            for chunk in chunks:
                future = self.client.submit(
                    self._process_chunk,
                    chunk,
                    resolution,
                    metadata
                )
                futures.append(future)
            
            # Gather results
            chunk_results = self.client.gather(futures)
            
            # Combine chunk results
            combined_results = self._combine_results(chunk_results)
            
            # Generate outputs
            if output_dir:
                self._save_outputs(combined_results, output_dir)
            
            return {
                'success': True,
                'metadata': metadata,
                'results': combined_results,
                'statistics': self._calculate_statistics(combined_results)
            }
            
        except Exception as e:
            logger.error(f"Error processing LIDAR file: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _read_metadata(self, filepath: Path) -> Dict:
        """Read LIDAR file metadata."""
        with laspy.open(filepath) as las:
            return {
                'point_count': las.header.point_count,
                'point_format': las.header.point_format.id,
                'scales': las.header.scales,
                'offsets': las.header.offsets,
                'min_bounds': las.header.min,
                'max_bounds': las.header.max,
                'crs': str(las.header.crs)
            }
    
    def _chunk_file(self, filepath: Path) -> List[np.ndarray]:
        """Split LIDAR file into manageable chunks."""
        chunks = []
        with laspy.open(filepath) as las:
            points_remaining = las.header.point_count
            while points_remaining > 0:
                chunk_size = min(self.chunk_size, points_remaining)
                chunk = las.read_points(chunk_size)
                chunks.append(chunk)
                points_remaining -= chunk_size
        return chunks
    
    def _process_chunk(
        self,
        chunk: np.ndarray,
        resolution: float,
        metadata: Dict
    ) -> Dict:
        """Process a chunk of LIDAR points."""
        try:
            # Extract point features
            points = np.vstack((chunk.x, chunk.y, chunk.z)).transpose()
            intensity = chunk.intensity
            classification = chunk.classification
            
            # Create KD-tree for spatial queries
            tree = cKDTree(points[:, :2])  # Using only x,y coordinates
            
            # Generate grid for the chunk
            min_x, min_y = np.min(points[:, :2], axis=0)
            max_x, max_y = np.max(points[:, :2], axis=0)
            
            x_grid = np.arange(min_x, max_x + resolution, resolution)
            y_grid = np.arange(min_y, max_y + resolution, resolution)
            
            # Initialize grids for different metrics
            elevation_grid = np.zeros((len(y_grid)-1, len(x_grid)-1))
            intensity_grid = np.zeros_like(elevation_grid)
            density_grid = np.zeros_like(elevation_grid)
            
            # Process each grid cell
            for i in range(len(y_grid)-1):
                for j in range(len(x_grid)-1):
                    # Find points in cell
                    cell_min = [x_grid[j], y_grid[i]]
                    cell_max = [x_grid[j+1], y_grid[i+1]]
                    
                    indices = tree.query_ball_box([cell_min, cell_max])
                    
                    if indices:
                        cell_points = points[indices]
                        elevation_grid[i, j] = np.mean(cell_points[:, 2])
                        intensity_grid[i, j] = np.mean(intensity[indices])
                        density_grid[i, j] = len(indices)
            
            # Detect features using image processor
            features = self.image_processor.process_large_dataset(elevation_grid)
            
            return {
                'bounds': [(min_x, min_y), (max_x, max_y)],
                'elevation': elevation_grid,
                'intensity': intensity_grid,
                'density': density_grid,
                'features': features
            }
            
        except Exception as e:
            logger.error(f"Error processing chunk: {str(e)}")
            return None
    
    def _combine_results(self, chunk_results: List[Dict]) -> Dict:
        """Combine results from multiple chunks."""
        # Filter out failed chunks
        valid_results = [r for r in chunk_results if r is not None]
        
        if not valid_results:
            return {}
        
        # Determine overall bounds
        all_bounds = [r['bounds'] for r in valid_results]
        min_x = min(b[0][0] for b in all_bounds)
        min_y = min(b[0][1] for b in all_bounds)
        max_x = max(b[1][0] for b in all_bounds)
        max_y = max(b[1][1] for b in all_bounds)
        
        # Combine feature detections
        all_features = []
        for result in valid_results:
            if 'features' in result and result['features'].get('success', False):
                all_features.extend(result['features'].get('features_detected', []))
        
        return {
            'bounds': [(min_x, min_y), (max_x, max_y)],
            'features': all_features,
            'chunk_count': len(valid_results)
        }
    
    def _calculate_statistics(self, results: Dict) -> Dict:
        """Calculate overall statistics from processing results."""
        if not results or not results.get('features'):
            return {}
        
        features = results['features']
        feature_types = [f['type'] for f in features]
        
        return {
            'feature_count': len(features),
            'type_distribution': {
                t: feature_types.count(t)
                for t in set(feature_types)
            },
            'area_statistics': {
                'min': min(f['area'] for f in features),
                'max': max(f['area'] for f in features),
                'mean': np.mean([f['area'] for f in features]),
                'std': np.std([f['area'] for f in features])
            }
        }
    
    def _save_outputs(self, results: Dict, output_dir: Path) -> None:
        """Save processing results to files."""
        # Save feature detections
        with open(output_dir / 'features.json', 'w') as f:
            json.dump(results['features'], f, indent=2)
        
        # Save statistics
        stats = self._calculate_statistics(results)
        with open(output_dir / 'statistics.json', 'w') as f:
            json.dump(stats, f, indent=2)
    
    def close(self):
        """Clean up resources."""
        self.client.close()
        self.cluster.close() 