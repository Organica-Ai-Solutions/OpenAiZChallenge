"""Advanced image processing module for satellite and LIDAR data analysis."""

import numpy as np
from typing import Tuple, Dict, Optional, List
import logging
from pathlib import Path
import rasterio
from rasterio.windows import Window
from scipy import ndimage
from scipy.signal import convolve2d
from skimage import feature, filters, morphology
from concurrent.futures import ThreadPoolExecutor
import dask.array as da

logger = logging.getLogger(__name__)

class ImageProcessor:
    """Advanced image processing for archaeological feature detection."""
    
    def __init__(self, chunk_size: int = 1024):
        """Initialize the image processor.
        
        Args:
            chunk_size: Size of chunks for processing large datasets
        """
        self.chunk_size = chunk_size
        self.kernels = self._initialize_kernels()
    
    def _initialize_kernels(self) -> Dict[str, np.ndarray]:
        """Initialize convolution kernels for feature detection."""
        return {
            'edge': np.array([[-1, -1, -1],
                            [-1,  8, -1],
                            [-1, -1, -1]]),
            'circle': self._create_circular_kernel(5),
            'rectangle': np.ones((5, 5)),
            'linear': np.array([[-1, -1,  2, -1, -1],
                              [-1, -1,  2, -1, -1],
                              [-1, -1,  2, -1, -1],
                              [-1, -1,  2, -1, -1],
                              [-1, -1,  2, -1, -1]])
        }
    
    def _create_circular_kernel(self, size: int) -> np.ndarray:
        """Create a circular convolution kernel."""
        y, x = np.ogrid[-size//2:size//2+1, -size//2:size//2+1]
        return (x**2 + y**2 <= (size//2)**2).astype(int)
    
    def process_large_dataset(
        self,
        filepath: Path,
        output_path: Optional[Path] = None
    ) -> Dict:
        """Process a large raster dataset using chunking.
        
        Args:
            filepath: Path to the raster file
            output_path: Optional path to save processed results
            
        Returns:
            Dictionary containing processing results
        """
        try:
            with rasterio.open(filepath) as src:
                # Create Dask array from raster data
                data = da.from_array(src.read(1), chunks=self.chunk_size)
                
                # Process data in parallel
                processed = data.map_overlap(
                    self._process_chunk,
                    depth=self.chunk_size//8,
                    boundary='reflect'
                )
                
                # Compute results
                result = processed.compute()
                
                # Save if output path provided
                if output_path:
                    self._save_results(result, output_path, src.profile)
                
                return {
                    'success': True,
                    'features_detected': self._analyze_results(result),
                    'statistics': self._calculate_statistics(result)
                }
                
        except Exception as e:
            logger.error(f"Error processing dataset: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _process_chunk(
        self,
        chunk: np.ndarray,
        overlap: int = 128
    ) -> np.ndarray:
        """Process a single data chunk with advanced feature detection.
        
        Args:
            chunk: Data chunk to process
            overlap: Overlap size for seamless processing
            
        Returns:
            Processed chunk
        """
        # Normalize data
        chunk_norm = self._normalize_data(chunk)
        
        # Apply various detection methods
        edge_map = self._detect_edges(chunk_norm)
        circle_map = self._detect_circles(chunk_norm)
        linear_map = self._detect_linear_features(chunk_norm)
        texture_map = self._analyze_texture(chunk_norm)
        
        # Combine detection maps
        combined = np.maximum.reduce([edge_map, circle_map, linear_map, texture_map])
        
        # Apply morphological operations
        cleaned = morphology.remove_small_objects(combined > 0.5)
        filled = morphology.remove_small_holes(cleaned)
        
        return filled.astype(float)
    
    def _normalize_data(self, data: np.ndarray) -> np.ndarray:
        """Normalize data and handle outliers."""
        q1, q3 = np.percentile(data, [25, 75])
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        clipped = np.clip(data, lower, upper)
        return (clipped - clipped.min()) / (clipped.max() - clipped.min())
    
    def _detect_edges(self, data: np.ndarray) -> np.ndarray:
        """Detect edges using multiple methods."""
        # Canny edge detection
        canny = feature.canny(data, sigma=2)
        
        # Sobel edges
        sobel_h = filters.sobel_h(data)
        sobel_v = filters.sobel_v(data)
        sobel = np.sqrt(sobel_h**2 + sobel_v**2)
        
        # Custom edge detection
        custom = np.abs(convolve2d(data, self.kernels['edge'], mode='same'))
        
        # Combine results
        return np.maximum.reduce([canny, sobel, custom])
    
    def _detect_circles(self, data: np.ndarray) -> np.ndarray:
        """Detect circular features."""
        # Use Hough transform for circle detection
        circles = feature.blob_log(data, max_sigma=30, num_sigma=10, threshold=.1)
        
        # Create circle map
        circle_map = np.zeros_like(data)
        for y, x, r in circles:
            rr, cc = draw.circle(y, x, r)
            mask = (rr >= 0) & (rr < data.shape[0]) & (cc >= 0) & (cc < data.shape[1])
            circle_map[rr[mask], cc[mask]] = 1
        
        return circle_map
    
    def _detect_linear_features(self, data: np.ndarray) -> np.ndarray:
        """Detect linear features using directional filters."""
        angles = np.arange(0, 180, 45)
        linear_maps = []
        
        for angle in angles:
            # Rotate kernel
            kernel = ndimage.rotate(self.kernels['linear'], angle, reshape=True)
            # Apply filter
            response = convolve2d(data, kernel, mode='same')
            linear_maps.append(np.abs(response))
        
        return np.maximum.reduce(linear_maps)
    
    def _analyze_texture(self, data: np.ndarray) -> np.ndarray:
        """Analyze texture patterns using GLCM."""
        from skimage.feature import graycomatrix, graycoprops
        
        # Calculate GLCM
        glcm = graycomatrix(
            (data * 255).astype(np.uint8),
            distances=[1],
            angles=[0, np.pi/4, np.pi/2, 3*np.pi/4],
            symmetric=True,
            normed=True
        )
        
        # Calculate texture properties
        contrast = graycoprops(glcm, 'contrast')[0, 0]
        correlation = graycoprops(glcm, 'correlation')[0, 0]
        energy = graycoprops(glcm, 'energy')[0, 0]
        
        # Create texture map based on properties
        texture_map = np.zeros_like(data)
        texture_map[data > np.mean(data)] = contrast * correlation * energy
        
        return texture_map
    
    def _analyze_results(self, result: np.ndarray) -> List[Dict]:
        """Analyze processing results to identify significant features."""
        features = []
        
        # Label connected components
        labels, num_features = ndimage.label(result > 0.5)
        
        # Analyze each feature
        for i in range(1, num_features + 1):
            feature_mask = labels == i
            props = regionprops(feature_mask.astype(int))[0]
            
            features.append({
                'area': props.area,
                'centroid': props.centroid,
                'orientation': props.orientation,
                'eccentricity': props.eccentricity,
                'type': self._classify_feature(props)
            })
        
        return features
    
    def _classify_feature(self, props) -> str:
        """Classify feature type based on properties."""
        if props.eccentricity < 0.3:
            return 'circular'
        elif props.eccentricity > 0.8:
            return 'linear'
        else:
            return 'complex'
    
    def _calculate_statistics(self, result: np.ndarray) -> Dict:
        """Calculate statistical measures of the results."""
        return {
            'total_features': np.sum(result > 0.5),
            'mean_size': np.mean(result[result > 0.5]),
            'density': np.sum(result > 0.5) / result.size,
            'distribution': {
                'min': np.min(result),
                'max': np.max(result),
                'mean': np.mean(result),
                'std': np.std(result)
            }
        }
    
    def _save_results(
        self,
        result: np.ndarray,
        output_path: Path,
        profile: Dict
    ) -> None:
        """Save processing results to file."""
        profile.update(dtype=rasterio.float32, count=1)
        
        with rasterio.open(output_path, 'w', **profile) as dst:
            dst.write(result.astype(rasterio.float32), 1) 