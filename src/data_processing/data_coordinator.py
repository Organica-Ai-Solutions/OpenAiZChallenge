from typing import Tuple, Dict, List, Optional
import os
from datetime import datetime
import numpy as np
from .satellite.sentinel_processor import SentinelProcessor
from .lidar.lidar_processor import LidarProcessor
from .utils.geo_utils import get_bbox_from_coords

class DataCoordinator:
    """Coordinates the processing of satellite and LIDAR data."""
    
    def __init__(
        self,
        sentinel_username: str,
        sentinel_password: str,
        lidar_data_dir: str,
        output_dir: str
    ):
        """
        Initialize the data coordinator.
        
        Args:
            sentinel_username: Copernicus Open Access Hub username
            sentinel_password: Copernicus Open Access Hub password
            lidar_data_dir: Directory containing LIDAR data
            output_dir: Directory for output files
        """
        self.sentinel_processor = SentinelProcessor(sentinel_username, sentinel_password)
        self.lidar_processor = LidarProcessor(lidar_data_dir)
        self.output_dir = output_dir
        
        # Create output directories if they don't exist
        os.makedirs(os.path.join(output_dir, 'satellite'), exist_ok=True)
        os.makedirs(os.path.join(output_dir, 'lidar'), exist_ok=True)
        os.makedirs(os.path.join(output_dir, 'combined'), exist_ok=True)
    
    def process_area(
        self,
        coordinates: Tuple[float, float],
        radius_km: float = 5.0,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        cloud_cover: float = 20.0
    ) -> Dict:
        """
        Process both satellite and LIDAR data for a given area.
        
        Args:
            coordinates: (latitude, longitude) tuple
            radius_km: Search radius in kilometers
            start_date: Start date for satellite imagery
            end_date: End date for satellite imagery
            cloud_cover: Maximum cloud cover percentage
            
        Returns:
            Dictionary containing processing results
        """
        results = {
            'satellite': {},
            'lidar': {},
            'combined': {}
        }
        
        # Process satellite data
        try:
            # Search for satellite imagery
            products = self.sentinel_processor.search_imagery(
                coordinates,
                radius_km,
                start_date,
                end_date,
                cloud_cover
            )
            
            if not products.empty:
                # Download and process the most recent product
                product_id = products.index[0]
                product_path = self.sentinel_processor.download_product(
                    product_id,
                    os.path.join(self.output_dir, 'satellite')
                )
                
                # Process the imagery
                processed_image = self.sentinel_processor.process_imagery(product_path)
                ndvi = self.sentinel_processor.calculate_ndvi(
                    processed_image[2],  # Red band
                    processed_image[3]   # NIR band
                )
                satellite_anomalies = self.sentinel_processor.detect_anomalies(ndvi)
                
                results['satellite'] = {
                    'product_id': product_id,
                    'product_path': product_path,
                    'ndvi': ndvi,
                    'anomalies': satellite_anomalies
                }
        except Exception as e:
            print(f"Error processing satellite data: {str(e)}")
        
        # Process LIDAR data
        try:
            # Find LIDAR files
            lidar_files = self.lidar_processor.find_lidar_files(coordinates, radius_km)
            
            if lidar_files:
                # Process the first LIDAR file
                lidar_data = self.lidar_processor.read_lidar_file(lidar_files[0])
                dem = self.lidar_processor.process_dem(lidar_data)
                slope = self.lidar_processor.calculate_slope(dem)
                hillshade = self.lidar_processor.generate_hillshade(dem)
                lidar_anomalies = self.lidar_processor.detect_anomalies(dem, slope)
                
                results['lidar'] = {
                    'file_path': lidar_files[0],
                    'dem': dem,
                    'slope': slope,
                    'hillshade': hillshade,
                    'anomalies': lidar_anomalies
                }
        except Exception as e:
            print(f"Error processing LIDAR data: {str(e)}")
        
        # Combine results if both data sources are available
        if results['satellite'] and results['lidar']:
            try:
                # Combine anomalies from both sources
                combined_anomalies = np.logical_or(
                    results['satellite']['anomalies'],
                    results['lidar']['anomalies']
                )
                
                results['combined'] = {
                    'anomalies': combined_anomalies,
                    'confidence': self._calculate_confidence(
                        results['satellite']['anomalies'],
                        results['lidar']['anomalies']
                    )
                }
            except Exception as e:
                print(f"Error combining results: {str(e)}")
        
        return results
    
    def _calculate_confidence(
        self,
        satellite_anomalies: np.ndarray,
        lidar_anomalies: np.ndarray
    ) -> float:
        """
        Calculate confidence score for combined anomalies.
        
        Args:
            satellite_anomalies: Binary mask of satellite anomalies
            lidar_anomalies: Binary mask of LIDAR anomalies
            
        Returns:
            Confidence score between 0 and 1
        """
        # Calculate overlap
        overlap = np.logical_and(satellite_anomalies, lidar_anomalies).sum()
        total = np.logical_or(satellite_anomalies, lidar_anomalies).sum()
        
        if total == 0:
            return 0.0
        
        # Calculate confidence based on overlap
        confidence = overlap / total
        
        # Adjust confidence based on data quality
        # This is a simple example - you might want to use more sophisticated methods
        if total < 100:  # Small number of anomalies
            confidence *= 0.8
        elif total > 1000:  # Large number of anomalies
            confidence *= 0.9
        
        return min(confidence, 1.0) 