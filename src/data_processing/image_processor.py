"""Advanced image processing module for satellite and LIDAR data analysis."""

import numpy as np
from typing import Tuple, Dict, Optional, List, Union
import logging
from pathlib import Path
import rasterio
from rasterio.windows import Window
from scipy import ndimage
from scipy.signal import convolve2d
from skimage import feature, filters, morphology, draw
from skimage.measure import regionprops
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
        data_input: Union[Path, np.ndarray],
        output_path: Optional[Path] = None,
        profile: Optional[Dict] = None
    ) -> Dict:
        """Process a large raster dataset using chunking.
        
        Args:
            data_input: Path to the raster file or a NumPy ndarray
            output_path: Optional path to save processed results (only if input is Path)
            profile: Optional rasterio profile, needed if saving an np.ndarray input.
                     If input is Path, profile is read from the file.
            
        Returns:
            Dictionary containing processing results
        """
        try:
            result_data_arr = None
            src_profile = profile

            if isinstance(data_input, Path):
                with rasterio.open(data_input) as src:
                    # Create Dask array from raster data
                    data_array = da.from_array(src.read(1), chunks=self.chunk_size)
                    if src_profile is None:
                        src_profile = src.profile
            elif isinstance(data_input, np.ndarray):
                data_array = da.from_array(data_input, chunks=self.chunk_size)
                if output_path and src_profile is None:
                    logger.warning(
                        "Output path provided for np.ndarray input, but no profile (georeferencing) information. "
                        "Result will not be saved as a georeferenced raster."
                    )
            else:
                raise ValueError("data_input must be a Path or a NumPy ndarray")
                
            # Process data in parallel
            processed_dask_array = data_array.map_overlap(
                self._process_chunk,
                depth=self.chunk_size//8,
                boundary='reflect'
            )
            
            # Compute results
            result_data_arr = processed_dask_array.compute()
            
            # Save if output path and profile are available
            if output_path and src_profile and isinstance(data_input, Path):
                self._save_results(result_data_arr, output_path, src_profile)
            elif output_path and not isinstance(data_input, Path):
                logger.warning("Saving to output_path is currently only fully supported for Path inputs.")
            
            return {
                'success': True,
                'processed_array': result_data_arr,
                'features_detected': self._analyze_results(result_data_arr),
                'statistics': self._calculate_statistics(result_data_arr)
            }
                
        except Exception as e:
            logger.error(f"Error processing dataset: {str(e)}")
            return {'success': False, 'error': str(e), 'processed_array': None}
    
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
        # skimage.feature.blob_log returns (y, x, sigma) for each blob found.
        # The radius of the blob is approximately sqrt(2) * sigma.
        blobs_log = feature.blob_log(data, max_sigma=30, num_sigma=10, threshold=.1)
        
        circle_map = np.zeros_like(data, dtype=bool)
        for blob in blobs_log:
            y, x, sigma = blob
            r = sigma * np.sqrt(2)
            # Ensure coordinates are integers for drawing
            # And that the circle is within bounds
            rr, cc = draw.disk((int(y), int(x)), int(r), shape=data.shape)
            circle_map[rr, cc] = True
        
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
        # Ensure input to ndimage.label is boolean or integer
        labeled_array, num_features = ndimage.label(result > 0.5) 
        
        # Get properties of labeled regions
        # Pass the labeled_array and the original intensity image (result) if needed for intensity properties
        # For now, props are calculated on the binary mask region, so intensity_image=result is not strictly needed
        # if we only use geometric props from the mask.
        props_list = regionprops(labeled_array, intensity_image=result) # Use result for intensity_image

        # Analyze each feature
        for props in props_list: # Iterate directly through props_list
            # props.label is the label number, starts from 1
            # feature_mask = labeled_array == props.label # This is already represented by props
            
            features.append({
                'label': props.label,
                'area': props.area, # Area of the region (number of pixels)
                'centroid': props.centroid, # (row, col)
                'orientation': props.orientation, # Angle between major axis and x-axis
                'eccentricity': props.eccentricity, # Eccentricity of the ellipse with same second moments
                'bbox': props.bbox, # (min_row, min_col, max_row, max_col)
                'intensity_mean': props.mean_intensity, # Mean intensity of the region in intensity_image
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