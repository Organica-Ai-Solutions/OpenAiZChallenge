import unittest
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from src.data_processing.satellite.sentinel_processor import SentinelProcessor
from src.data_processing.lidar.lidar_processor import LidarProcessor

class TestDataAccess(unittest.TestCase):
    """Test data source integrations."""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment."""
        # Load environment variables
        load_dotenv()
        
        # Debug: Check if credentials are loaded
        print("\nChecking credentials:")
        print(f"Copernicus username exists: {'COPERNICUS_USERNAME' in os.environ}")
        print(f"Copernicus password exists: {'COPERNICUS_PASSWORD' in os.environ}")
        print(f"Earthdata username exists: {'EARTHDATA_USERNAME' in os.environ}")
        print(f"Earthdata password exists: {'EARTHDATA_PASSWORD' in os.environ}")
        print(f"Earthdata token exists: {'EARTHDATA_TOKEN' in os.environ}\n")
        
        # Test area (Rome, Italy)
        cls.test_area = {
            'north': 41.9,
            'south': 41.8,
            'east': 12.6,
            'west': 12.5
        }
        
        # Test time range (last 30 days)
        cls.end_date = datetime.utcnow()
        cls.start_date = cls.end_date - timedelta(days=30)
        
        # Initialize processors
        cls.sentinel_processor = SentinelProcessor(
            credentials={
                'username': os.getenv('COPERNICUS_USERNAME'),
                'password': os.getenv('COPERNICUS_PASSWORD')
            },
            output_dir='test_data/sentinel'
        )
        
        cls.lidar_processor = LidarProcessor(
            credentials={
                'username': os.getenv('EARTHDATA_USERNAME'),
                'password': os.getenv('EARTHDATA_PASSWORD'),
                'token': os.getenv('EARTHDATA_TOKEN')
            },
            output_dir='test_data/lidar'
        )
    
    def test_sentinel_authentication(self):
        """Test Copernicus authentication."""
        try:
            # Test authentication by making a simple request
            token = self.sentinel_processor._get_token()
            self.assertIsNotNone(token)
            self.assertIsInstance(token, str)
            print("✅ Copernicus authentication successful")
        except Exception as e:
            self.fail(f"Copernicus authentication failed: {str(e)}")
    
    def test_sentinel_search(self):
        """Test Sentinel-2 imagery search."""
        try:
            # Search for imagery
            results = self.sentinel_processor.search_data(
                self.test_area,
                self.start_date,
                self.end_date
            )
            
            # Verify results structure
            self.assertIn('features', results)
            if results['features']:
                feature = results['features'][0]
                self.assertIn('id', feature)
                self.assertIn('properties', feature)
                self.assertIn('geometry', feature)
                print(f"✅ Found {len(results['features'])} Sentinel-2 images")
            else:
                print("ℹ️ No Sentinel-2 images found in the test area")
        except Exception as e:
            self.fail(f"Sentinel-2 search failed: {str(e)}")
    
    def test_lidar_authentication(self):
        """Test NASA Earthdata authentication."""
        try:
            # Test authentication by making a simple request
            response = self.lidar_processor._make_request(
                'GET',
                f"{self.lidar_processor.api_url}/search/collections.json"
            )
            self.assertEqual(response.status_code, 200)
            print("✅ NASA Earthdata authentication successful")
        except Exception as e:
            self.fail(f"NASA Earthdata authentication failed: {str(e)}")
    
    def test_lidar_search(self):
        """Test GEDI LIDAR data search."""
        try:
            # Search for LIDAR data
            results = self.lidar_processor.search_data(
                self.test_area,
                self.start_date,
                self.end_date
            )
            
            # Verify results structure
            self.assertIn('features', results)
            if results['features']:
                feature = results['features'][0]
                self.assertIn('id', feature)
                self.assertIn('properties', feature)
                self.assertIn('geometry', feature)
                print(f"✅ Found {len(results['features'])} GEDI LIDAR datasets")
            else:
                print("ℹ️ No GEDI LIDAR data found in the test area")
        except Exception as e:
            self.fail(f"GEDI LIDAR search failed: {str(e)}")

if __name__ == '__main__':
    unittest.main() 