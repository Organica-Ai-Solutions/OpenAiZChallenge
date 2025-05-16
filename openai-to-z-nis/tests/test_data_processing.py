import os
import unittest
from datetime import datetime, timedelta
import numpy as np
from src.data_processing.satellite.sentinel_processor import SentinelProcessor
from src.data_processing.lidar.lidar_processor import LidarProcessor
from src.data_processing.data_coordinator import DataCoordinator

class TestDataProcessing(unittest.TestCase):
    def setUp(self):
        # Set up test directories
        self.test_dir = os.path.join(os.path.dirname(__file__), 'test_data')
        os.makedirs(self.test_dir, exist_ok=True)
        
        # Initialize processors with test credentials
        self.sentinel_processor = SentinelProcessor(
            username='test_user',
            password='test_pass'
        )
        
        self.lidar_processor = LidarProcessor(
            data_dir=os.path.join(self.test_dir, 'lidar')
        )
        
        self.data_coordinator = DataCoordinator(
            sentinel_username='test_user',
            sentinel_password='test_pass',
            lidar_data_dir=os.path.join(self.test_dir, 'lidar'),
            output_dir=os.path.join(self.test_dir, 'output')
        )
    
    def test_sentinel_processing(self):
        """Test Sentinel-2 data processing."""
        # Test coordinates (Amazon region)
        coordinates = (-3.1190, -60.0217)  # Manaus, Brazil
        
        # Test search_imagery
        products = self.sentinel_processor.search_imagery(
            coordinates,
            radius_km=5.0,
            start_date=datetime.now() - timedelta(days=30),
            end_date=datetime.now(),
            cloud_cover=20.0
        )
        
        self.assertIsNotNone(products)
        if not products.empty:
            # Test process_imagery
            product_id = products.index[0]
            product_path = self.sentinel_processor.download_product(
                product_id,
                os.path.join(self.test_dir, 'satellite')
            )
            
            processed_image = self.sentinel_processor.process_imagery(product_path)
            self.assertIsInstance(processed_image, np.ndarray)
            self.assertEqual(len(processed_image.shape), 3)
            
            # Test NDVI calculation
            ndvi = self.sentinel_processor.calculate_ndvi(
                processed_image[2],  # Red band
                processed_image[3]   # NIR band
            )
            self.assertIsInstance(ndvi, np.ndarray)
            self.assertTrue(np.all((ndvi >= -1) & (ndvi <= 1)))
            
            # Test anomaly detection
            anomalies = self.sentinel_processor.detect_anomalies(ndvi)
            self.assertIsInstance(anomalies, np.ndarray)
            self.assertEqual(anomalies.dtype, bool)
    
    def test_lidar_processing(self):
        """Test LIDAR data processing."""
        # Create test LIDAR data
        test_lidar_path = os.path.join(self.test_dir, 'lidar', 'test.las')
        os.makedirs(os.path.dirname(test_lidar_path), exist_ok=True)
        
        # Test DEM generation
        lidar_data = self.lidar_processor.read_lidar_file(test_lidar_path)
        dem = self.lidar_processor.process_dem(lidar_data)
        self.assertIsInstance(dem, np.ndarray)
        
        # Test slope calculation
        slope = self.lidar_processor.calculate_slope(dem)
        self.assertIsInstance(slope, np.ndarray)
        self.assertTrue(np.all(slope >= 0))
        
        # Test hillshade generation
        hillshade = self.lidar_processor.generate_hillshade(dem)
        self.assertIsInstance(hillshade, np.ndarray)
        self.assertTrue(np.all((hillshade >= -1) & (hillshade <= 1)))
        
        # Test anomaly detection
        anomalies = self.lidar_processor.detect_anomalies(dem, slope)
        self.assertIsInstance(anomalies, np.ndarray)
        self.assertEqual(anomalies.dtype, bool)
    
    def test_data_coordinator(self):
        """Test data coordinator integration."""
        # Test coordinates (Amazon region)
        coordinates = (-3.1190, -60.0217)  # Manaus, Brazil
        
        # Test area processing
        results = self.data_coordinator.process_area(
            coordinates,
            radius_km=5.0,
            start_date=datetime.now() - timedelta(days=30),
            end_date=datetime.now(),
            cloud_cover=20.0
        )
        
        self.assertIsInstance(results, dict)
        self.assertIn('satellite', results)
        self.assertIn('lidar', results)
        self.assertIn('combined', results)

if __name__ == '__main__':
    unittest.main() 