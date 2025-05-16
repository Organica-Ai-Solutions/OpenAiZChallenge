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

class LidarProcessor:
    """Process GEDI LIDAR data for archaeological site detection."""
    
    def __init__(self, credentials: Dict[str, str], output_dir: str):
        """Initialize the processor with credentials and output directory."""
        self.username = credentials.get('username')
        self.password = credentials.get('password')
        self.token = credentials.get('token')
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
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
    
    def process_area(self, 
                    area: Dict[str, float],
                    start_date: datetime,
                    end_date: datetime) -> Dict:
        """Process a specific area for archaeological features using LIDAR data."""
        # Search for available data
        results = self.search_data(area, start_date, end_date)
        
        if not results.get('features'):
            return {
                'status': 'error',
                'message': 'No suitable LIDAR data found for the specified area and time period'
            }
        
        processed_results = []
        for feature in results['features']:
            try:
                # Download the data
                data_path = self.download_data(feature['id'])
                
                # Process the data
                data = self.process_data(data_path)
                
                # Detect anomalies
                anomalies = self.detect_anomalies(data)
                
                # Store results
                processed_results.append({
                    'granule_id': feature['id'],
                    'acquisition_date': feature['properties']['time'],
                    'coordinates': feature['geometry']['coordinates'],
                    'anomalies': anomalies.tolist() if anomalies is not None else None
                })
                
            except Exception as e:
                print(f"Error processing granule {feature['id']}: {str(e)}")
                continue
        
        return {
            'status': 'success',
            'results': processed_results
        }
    
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