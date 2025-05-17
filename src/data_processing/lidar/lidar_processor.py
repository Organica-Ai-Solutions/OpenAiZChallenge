from typing import Tuple, Optional, List, Dict
import os
import numpy as np
import laspy
from scipy import ndimage
from ..utils.geo_utils import get_bbox_from_coords
import requests
from datetime import datetime
from pathlib import Path
import json
import h5py
import logging
import rasterio
from rasterio.transform import from_origin

logger = logging.getLogger(__name__)

class LidarProcessor:
    """Advanced LIDAR data processor for archaeological site detection."""
    
    def __init__(
        self, 
        credentials: Dict[str, str], 
        output_dir: str = 'data/lidar'
    ):
        """
        Initialize LIDAR data processor.
        
        Args:
            credentials: Dictionary with authentication details
            output_dir: Directory to save processed LIDAR data
        """
        self.username = credentials.get('username')
        self.password = credentials.get('password')
        self.token = credentials.get('token')
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
        # NASA Earthdata API configuration
        self.api_url = os.getenv('EARTHDATA_API_URL', 'https://cmr.earthdata.nasa.gov')
        self.collection_id = os.getenv('EARTHDATA_COLLECTION_ID', 'C1940468264-LPCLOUD')
    
    def _make_request(self, method: str, url: str, **kwargs) -> requests.Response:
        """Make an authenticated request to NASA Earthdata API."""
        headers = kwargs.pop('headers', {})
        headers['Authorization'] = f"Bearer {self.token}"
        
        response = requests.request(method, url, headers=headers, **kwargs)
        response.raise_for_status()
        return response
    
    def search_data(self, 
                   area: Dict[str, float],
                   start_date: datetime,
                   end_date: datetime) -> Dict:
        """Search for GEDI LIDAR data in the specified area and time range."""
        # Convert dates to ISO format
        start_date_str = start_date.isoformat() + 'Z'
        end_date_str = end_date.isoformat() + 'Z'
        
        # Create bounding box
        bbox = f"{area['west']},{area['south']},{area['east']},{area['north']}"
        
        # Search parameters
        params = {
            'collection_concept_id': self.collection_id,
            'temporal': f"{start_date_str},{end_date_str}",
            'bounding_box': bbox,
            'page_size': 100
        }
        
        # Make request to NASA Earthdata API
        response = self._make_request(
            'GET',
            f"{self.api_url}/search/granules.json",
            params=params
        )
        
        return response.json()
    
    def download_data(self, granule_id: str) -> str:
        """Download GEDI LIDAR data for a specific granule."""
        # Get download URL
        response = self._make_request(
            'GET',
            f"{self.api_url}/search/granules/{granule_id}.json"
        )
        
        granule_data = response.json()
        download_url = granule_data['links'][0]['href']
        
        # Download the data
        output_path = self.output_dir / f"{granule_id}.h5"
        response = self._make_request('GET', download_url, stream=True)
        
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        return str(output_path)
    
    def process_data(self, data_path: str) -> np.ndarray:
        """Process GEDI LIDAR data for archaeological feature detection."""
        with h5py.File(data_path, 'r') as f:
            # Extract relevant data (e.g., elevation data)
            elevation_data = f['elevation'][:]
            return elevation_data
    
    def detect_anomalies(self, data: np.ndarray, threshold: float = 2.0) -> np.ndarray:
        """Detect anomalies in LIDAR data that might indicate archaeological features."""
        # Calculate mean and standard deviation
        mean = np.mean(data)
        std = np.std(data)
        
        # Detect anomalies (values more than 'threshold' standard deviations from the mean)
        anomalies = np.abs(data - mean) > (threshold * std)
        return anomalies
    
    def download_lidar_data(
        self, 
        area: Dict[str, float], 
        start_date: datetime, 
        end_date: datetime
    ) -> List[str]:
        """
        Download LIDAR data for a specific area and time range.
        
        Args:
            area: Dictionary with 'north', 'south', 'east', 'west' coordinates
            start_date: Start of search period
            end_date: End of search period
        
        Returns:
            List of downloaded LIDAR file paths
        """
        # In a real implementation, this would use NASA's Earthdata API
        # For now, we'll simulate the download process
        try:
            # Simulated download logic
            downloaded_files = []
            for i in range(3):  # Simulate multiple tiles
                filename = f"lidar_tile_{i}_{start_date.year}.las"
                filepath = os.path.join(self.output_dir, filename)
                
                # Simulate file creation (in reality, this would be an actual download)
                with laspy.create(filepath) as las_file:
                    # Create some mock point cloud data
                    las_file.x = np.random.uniform(
                        area['west'], area['east'], 10000
                    )
                    las_file.y = np.random.uniform(
                        area['south'], area['north'], 10000
                    )
                    las_file.z = np.random.uniform(0, 100, 10000)
                
                downloaded_files.append(filepath)
            
            return downloaded_files
        
        except Exception as e:
            logger.error(f"LIDAR data download error: {e}")
            return []
    
    def process_point_cloud(
        self, 
        las_file_path: str
    ) -> Dict[str, np.ndarray]:
        """
        Process a LIDAR point cloud file.
        
        Args:
            las_file_path: Path to the LAS/LAZ file
        
        Returns:
            Dictionary of processed LIDAR data
        """
        try:
            # Read the LAS file
            las_data = laspy.read(las_file_path)
            
            # Extract point cloud data
            x = las_data.x
            y = las_data.y
            z = las_data.z
            
            # Create Digital Terrain Model (DTM)
            # This is a simplified version. Real-world processing would be more complex
            grid_resolution = 1.0  # 1-meter grid
            x_min, x_max = x.min(), x.max()
            y_min, y_max = y.min(), y.max()
            
            # Create grid
            x_grid = np.arange(x_min, x_max, grid_resolution)
            y_grid = np.arange(y_min, y_max, grid_resolution)
            
            # Interpolate elevation
            dtm = np.zeros((len(y_grid), len(x_grid)))
            for i, yi in enumerate(y_grid):
                for j, xj in enumerate(x_grid):
                    # Find points within a small radius
                    mask = (
                        (x >= xj) & (x < xj + grid_resolution) & 
                        (y >= yi) & (y < yi + grid_resolution)
                    )
                    if mask.sum() > 0:
                        dtm[i, j] = z[mask].mean()
            
            # Calculate derivatives
            slope = np.gradient(dtm)[0]
            aspect = np.gradient(dtm)[1]
            
            return {
                'dtm': dtm,
                'slope': slope,
                'aspect': aspect,
                'point_density': len(x) / ((x_max - x_min) * (y_max - y_min))
            }
        
        except Exception as e:
            logger.error(f"Error processing point cloud {las_file_path}: {e}")
            return {}
    
    def detect_archaeological_features(
        self, 
        dtm: np.ndarray, 
        slope: np.ndarray
    ) -> Dict[str, np.ndarray]:
        """
        Detect potential archaeological features in LIDAR data.
        
        Args:
            dtm: Digital Terrain Model
            slope: Slope array
        
        Returns:
            Dictionary of detected features
        """
        try:
            # Detect potential archaeological features
            
            # 1. Identify flat areas (potential settlements)
            flat_areas = np.abs(slope) < 0.1
            
            # 2. Detect geometric patterns
            # Use morphological operations to find structured patterns
            kernel = np.ones((5, 5), np.uint8)
            geometric_structures = ndimage.binary_opening(flat_areas, kernel)
            
            # 3. Detect mounds or artificial elevations
            elevation_variance = ndimage.uniform_filter(dtm, size=10)
            potential_mounds = np.abs(dtm - elevation_variance) > 2
            
            return {
                'flat_areas': flat_areas,
                'geometric_structures': geometric_structures,
                'potential_mounds': potential_mounds
            }
        
        except Exception as e:
            logger.error(f"Feature detection error: {e}")
            return {}
    
    def export_feature_map(
        self, 
        features: Dict[str, np.ndarray], 
        output_filename: str
    ) -> str:
        """
        Export detected features to a GeoTIFF file.
        
        Args:
            features: Dictionary of feature arrays
            output_filename: Name of the output file
        
        Returns:
            Path to the exported file
        """
        try:
            output_path = os.path.join(self.output_dir, output_filename)
            
            # Combine features into a single array
            feature_map = np.zeros_like(features['flat_areas'], dtype=np.uint8)
            feature_map += features['flat_areas'].astype(np.uint8) * 1
            feature_map += features['geometric_structures'].astype(np.uint8) * 2
            feature_map += features['potential_mounds'].astype(np.uint8) * 4
            
            # Create a GeoTIFF
            with rasterio.open(
                output_path, 
                'w', 
                driver='GTiff',
                height=feature_map.shape[0],
                width=feature_map.shape[1],
                count=1,
                dtype=feature_map.dtype,
                crs='+proj=latlong',
                transform=from_origin(0, 0, 1, 1)
            ) as dst:
                dst.write(feature_map, 1)
            
            return output_path
        
        except Exception as e:
            logger.error(f"Feature map export error: {e}")
            return ""
    
    def process_area(
        self, 
        area: Dict[str, float], 
        start_date: datetime, 
        end_date: datetime
    ) -> List[Dict]:
        """
        Comprehensive LIDAR data processing for an area.
        
        Args:
            area: Dictionary with 'north', 'south', 'east', 'west' coordinates
            start_date: Start of search period
            end_date: End of search period
        
        Returns:
            List of processing results
        """
        results = []
        
        try:
            # Download LIDAR data
            lidar_files = self.download_lidar_data(area, start_date, end_date)
            
            for lidar_file in lidar_files:
                # Process point cloud
                processed_data = self.process_point_cloud(lidar_file)
                
                # Detect archaeological features
                features = self.detect_archaeological_features(
                    processed_data['dtm'], 
                    processed_data['slope']
                )
                
                # Export feature map
                feature_map_path = self.export_feature_map(
                    features, 
                    f"archaeological_features_{os.path.basename(lidar_file)}.tif"
                )
                
                # Compile results
                results.append({
                    'input_file': lidar_file,
                    'feature_map': feature_map_path,
                    'point_density': processed_data.get('point_density', 0),
                    'detected_features': {
                        'flat_areas': features.get('flat_areas', []).sum(),
                        'geometric_structures': features.get('geometric_structures', []).sum(),
                        'potential_mounds': features.get('potential_mounds', []).sum()
                    }
                })
        
        except Exception as e:
            logger.error(f"LIDAR area processing error: {e}")
        
        return results
    
    def find_lidar_files(
        self,
        coordinates: Tuple[float, float],
        radius_km: float = 5.0
    ) -> List[str]:
        """
        Find LIDAR files covering the specified area.
        
        Args:
            coordinates: (latitude, longitude) tuple
            radius_km: Search radius in kilometers
            
        Returns:
            List of LIDAR file paths
        """
        # Implementation will depend on how LIDAR files are organized
        # This is a placeholder for the actual file finding logic
        pass
    
    def read_lidar_file(self, file_path: str) -> laspy.LasData:
        """
        Read a LIDAR file.
        
        Args:
            file_path: Path to the LIDAR file
            
        Returns:
            LIDAR data object
        """
        return laspy.read(file_path)
    
    def process_dem(
        self,
        lidar_data: laspy.LasData,
        resolution: float = 1.0
    ) -> np.ndarray:
        """
        Generate Digital Elevation Model (DEM) from LIDAR data.
        
        Args:
            lidar_data: LIDAR data object
            resolution: DEM resolution in meters
            
        Returns:
            DEM array
        """
        # Get point coordinates
        x = lidar_data.x
        y = lidar_data.y
        z = lidar_data.z
        
        # Calculate grid dimensions
        x_min, x_max = np.min(x), np.max(x)
        y_min, y_max = np.min(y), np.max(y)
        
        # Create grid
        x_grid = np.arange(x_min, x_max + resolution, resolution)
        y_grid = np.arange(y_min, y_max + resolution, resolution)
        
        # Initialize DEM array
        dem = np.zeros((len(y_grid), len(x_grid)))
        count = np.zeros_like(dem)
        
        # Bin points into grid cells
        x_indices = np.floor((x - x_min) / resolution).astype(int)
        y_indices = np.floor((y - y_min) / resolution).astype(int)
        
        # Ensure indices are within bounds
        valid_indices = (x_indices >= 0) & (x_indices < len(x_grid)) & \
                       (y_indices >= 0) & (y_indices < len(y_grid))
        
        x_indices = x_indices[valid_indices]
        y_indices = y_indices[valid_indices]
        z = z[valid_indices]
        
        # Calculate mean elevation for each cell
        for i in range(len(x_indices)):
            dem[y_indices[i], x_indices[i]] += z[i]
            count[y_indices[i], x_indices[i]] += 1
        
        # Calculate mean elevation
        valid_cells = count > 0
        dem[valid_cells] /= count[valid_cells]
        
        # Fill gaps using interpolation
        mask = ~valid_cells
        if np.any(mask):
            # Get coordinates of valid cells
            y_coords, x_coords = np.where(valid_cells)
            valid_elevations = dem[valid_cells]
            
            # Get coordinates of invalid cells
            y_invalid, x_invalid = np.where(mask)
            
            # Interpolate missing values
            from scipy.interpolate import griddata
            points = np.column_stack((x_coords, y_coords))
            values = valid_elevations
            xi = np.column_stack((x_invalid, y_invalid))
            
            # Perform interpolation
            interpolated = griddata(points, values, xi, method='linear')
            
            # Fill gaps in DEM
            dem[mask] = interpolated
        
        return dem
    
    def calculate_slope(self, dem: np.ndarray) -> np.ndarray:
        """
        Calculate slope from DEM.
        
        Args:
            dem: Digital Elevation Model array
            
        Returns:
            Slope array in degrees
        """
        # Calculate gradients
        dy, dx = np.gradient(dem)
        
        # Calculate slope
        slope = np.arctan(np.sqrt(dx**2 + dy**2))
        return np.degrees(slope)
    
    def detect_anomalies(
        self,
        dem: np.ndarray,
        slope: np.ndarray,
        min_height_diff: float = 0.5,
        min_area: int = 100
    ) -> np.ndarray:
        """
        Detect anomalies in elevation and slope that might indicate archaeological features.
        
        Args:
            dem: Digital Elevation Model array
            slope: Slope array
            min_height_diff: Minimum height difference for anomaly detection
            min_area: Minimum area (in pixels) for anomaly detection
            
        Returns:
            Binary mask of detected anomalies
        """
        # Calculate local statistics
        local_mean = ndimage.uniform_filter(dem, size=15)
        local_std = np.sqrt(ndimage.uniform_filter(dem**2, size=15) - local_mean**2)
        
        # Calculate z-scores for elevation
        z_scores = (dem - local_mean) / (local_std + 1e-6)
        
        # Detect elevation anomalies
        elevation_anomalies = np.abs(z_scores) > 2.0  # 2 standard deviations
        
        # Detect slope anomalies
        slope_anomalies = slope > 30.0  # Steep slopes (>30 degrees)
        
        # Combine elevation and slope anomalies
        anomalies = np.logical_or(elevation_anomalies, slope_anomalies)
        
        # Apply morphological operations to clean up the mask
        anomalies = ndimage.binary_opening(anomalies, structure=np.ones((3,3)))
        anomalies = ndimage.binary_closing(anomalies, structure=np.ones((3,3)))
        
        # Remove small objects
        labeled_objects, num_objects = ndimage.label(anomalies)
        object_sizes = np.bincount(labeled_objects.ravel())
        small_objects = object_sizes < min_area
        small_objects[0] = 0  # Don't remove background
        anomalies = ~small_objects[labeled_objects]
        
        # Calculate height differences
        height_diffs = np.abs(dem - local_mean)
        height_anomalies = height_diffs > min_height_diff
        
        # Combine with height difference anomalies
        anomalies = np.logical_and(anomalies, height_anomalies)
        
        return anomalies
    
    def generate_hillshade(
        self,
        dem: np.ndarray,
        azimuth: float = 315.0,
        altitude: float = 45.0
    ) -> np.ndarray:
        """
        Generate hillshade from DEM.
        
        Args:
            dem: Digital Elevation Model array
            azimuth: Light source azimuth in degrees
            altitude: Light source altitude in degrees
            
        Returns:
            Hillshade array
        """
        # Calculate gradients
        dy, dx = np.gradient(dem)
        
        # Convert angles to radians
        azimuth_rad = np.radians(azimuth)
        altitude_rad = np.radians(altitude)
        
        # Calculate hillshade
        slope = np.arctan(np.sqrt(dx**2 + dy**2))
        aspect = np.arctan2(dy, dx)
        
        hillshade = (np.sin(altitude_rad) * np.sin(slope) +
                    np.cos(altitude_rad) * np.cos(slope) *
                    np.cos(azimuth_rad - aspect))
        
        return hillshade 