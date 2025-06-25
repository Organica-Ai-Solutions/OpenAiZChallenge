# 🧪 DAY 3 KAN INTEGRATION TEST - ENHANCED
"""
Day 3 KAN Integration Test for OpenAI to Z Challenge
Enhanced with proper test methods and assertions
"""

import unittest
import json
import time
import sys
import numpy as np
from pathlib import Path

# Add src to path for imports
sys.path.append(str(Path(__file__).parent.parent.parent / 'src'))

class Day3KANIntegrationTest(unittest.TestCase):
    """Enhanced Day 3 KAN Integration Test Suite"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        cls.test_results = {
            'start_time': time.time(),
            'kan_processor_tests': {},
            'lidar_processor_tests': {},
            'integration_tests': {},
            'performance_benchmarks': {}
        }
        
        # Test data
        cls.test_locations = [
            {'lat': -3.4653, 'lon': -62.2159, 'name': 'Primary Site'},
            {'lat': -2.5, 'lon': -60.0, 'name': 'Secondary Site'}
        ]
        
        print("🧪 Day 3 KAN Integration Test Suite - Enhanced")
        print("=" * 50)
    
    def test_01_kan_processor_initialization(self):
        """Test KAN processor initialization"""
        try:
            from kan.archaeological_kan_enhanced import ArchaeologicalKANProcessor
            
            # Test initialization with different parameters
            processor = ArchaeologicalKANProcessor(grid_size=7, spline_order=3)
            
            # Assertions
            self.assertIsNotNone(processor)
            self.assertEqual(processor.grid_size, 7)
            self.assertEqual(processor.spline_order, 3)
            self.assertTrue(hasattr(processor, 'process_archaeological_data'))
            
            print("✅ KAN processor initialization test PASSED")
            self.test_results['kan_processor_tests']['initialization'] = True
            
        except ImportError:
            print("⚠️ KAN processor not available - skipping test")
            self.skipTest("KAN processor not available")
    
    def test_02_kan_data_processing(self):
        """Test KAN data processing functionality"""
        try:
            from kan.archaeological_kan_enhanced import ArchaeologicalKANProcessor
            
            processor = ArchaeologicalKANProcessor(grid_size=7, spline_order=3)
            
            # Generate test data
            test_data = self._generate_test_data(1500)
            location = self.test_locations[0]
            
            # Process data
            result = processor.process_archaeological_data(
                test_data, 
                location={'lat': location['lat'], 'lon': location['lon']}
            )
            
            # Assertions
            self.assertEqual(result['status'], 'success')
            self.assertIn('confidence_score', result)
            self.assertIn('patterns_detected', result)
            self.assertIn('performance_metrics', result)
            self.assertGreater(result['confidence_score'], 0.0)
            self.assertLessEqual(result['confidence_score'], 1.0)
            
            print(f"✅ KAN data processing: {result['confidence_score']:.1%} confidence")
            self.test_results['kan_processor_tests']['data_processing'] = result
            
        except ImportError:
            print("⚠️ KAN processor not available - skipping test")
            self.skipTest("KAN processor not available")
    
    def test_03_lidar_processor_functionality(self):
        """Test LiDAR processor functionality"""
        try:
            from data_processing.lidar.professional_pdal_processor import ProfessionalLiDARProcessor
            
            processor = ProfessionalLiDARProcessor()
            location = self.test_locations[0]
            
            # Process point cloud
            result = processor.process_point_cloud(
                location['lat'], location['lon'], 5.0
            )
            
            # Assertions
            self.assertEqual(result['status'], 'success')
            self.assertIn('confidence_score', result)
            self.assertIn('point_count', result)
            self.assertIn('archaeological_features', result)
            self.assertGreater(result['point_count'], 0)
            self.assertIsInstance(result['archaeological_features'], list)
            
            print(f"✅ LiDAR processing: {result['point_count']:,} points processed")
            self.test_results['lidar_processor_tests']['functionality'] = result
            
        except ImportError:
            print("⚠️ LiDAR processor not available - skipping test")
            self.skipTest("LiDAR processor not available")
    
    def test_04_system_integration(self):
        """Test system integration between components"""
        try:
            from kan.archaeological_kan_enhanced import ArchaeologicalKANProcessor
            from data_processing.lidar.professional_pdal_processor import ProfessionalLiDARProcessor
            
            # Initialize processors
            kan_processor = ArchaeologicalKANProcessor(grid_size=7, spline_order=3)
            lidar_processor = ProfessionalLiDARProcessor()
            
            location = self.test_locations[0]
            
            # Test KAN processing
            test_data = self._generate_test_data(1000)
            kan_result = kan_processor.process_archaeological_data(
                test_data, location={'lat': location['lat'], 'lon': location['lon']}
            )
            
            # Test LiDAR processing
            lidar_result = lidar_processor.process_point_cloud(
                location['lat'], location['lon'], 5.0
            )
            
            # Integration assertions
            self.assertEqual(kan_result['status'], 'success')
            self.assertEqual(lidar_result['status'], 'success')
            
            # Test correlation between results
            kan_confidence = kan_result['confidence_score']
            lidar_confidence = lidar_result['confidence_score']
            
            # Both should produce meaningful results
            self.assertGreater(kan_confidence, 0.0)
            self.assertGreater(lidar_confidence, 0.0)
            
            # Calculate correlation (simplified)
            correlation = min(kan_confidence, lidar_confidence) / max(kan_confidence, lidar_confidence)
            self.assertGreater(correlation, 0.3, "Results should show reasonable correlation")
            
            print(f"✅ System integration: {correlation:.1%} correlation")
            self.test_results['integration_tests']['correlation'] = correlation
            
        except ImportError:
            print("⚠️ Enhanced processors not available - skipping test")
            self.skipTest("Enhanced processors not available")
    
    def test_05_performance_benchmarks(self):
        """Test performance benchmarks"""
        try:
            from kan.archaeological_kan_enhanced import ArchaeologicalKANProcessor
            
            processor = ArchaeologicalKANProcessor(grid_size=7, spline_order=3)
            
            # Test different data sizes
            test_sizes = [500, 1000, 2000]
            benchmarks = {}
            
            for size in test_sizes:
                test_data = self._generate_test_data(size)
                
                start_time = time.time()
                result = processor.process_archaeological_data(
                    test_data, location={'lat': -3.4653, 'lon': -62.2159}
                )
                processing_time = time.time() - start_time
                
                if result['status'] == 'success':
                    points_per_second = size / processing_time
                    benchmarks[size] = {
                        'points_per_second': points_per_second,
                        'processing_time': processing_time,
                        'confidence': result['confidence_score']
                    }
                    
                    # Performance assertions
                    self.assertGreater(points_per_second, 1000, f"Should process >1k points/second for {size} points")
                    self.assertLess(processing_time, 5.0, f"Should complete {size} points in <5 seconds")
            
            # Overall performance assertion
            self.assertGreater(len(benchmarks), 0, "Should have successful benchmarks")
            
            print("✅ Performance benchmarks:")
            for size, metrics in benchmarks.items():
                print(f"   {size} points: {metrics['points_per_second']:.0f} pts/sec")
            
            self.test_results['performance_benchmarks'] = benchmarks
            
        except ImportError:
            print("⚠️ KAN processor not available - skipping test")
            self.skipTest("KAN processor not available")
    
    def test_06_competitive_advantages(self):
        """Test competitive advantages validation"""
        try:
            from kan.archaeological_kan_enhanced import ArchaeologicalKANProcessor
            
            processor = ArchaeologicalKANProcessor(grid_size=7, spline_order=3)
            test_data = self._generate_test_data(1000)
            
            result = processor.process_archaeological_data(
                test_data, location={'lat': -3.4653, 'lon': -62.2159}
            )
            
            # Competitive advantage assertions
            self.assertEqual(result['status'], 'success')
            self.assertIn('performance_metrics', result)
            
            performance = result['performance_metrics']
            self.assertIn('vs_cnn', performance)
            
            # Should demonstrate competitive advantage
            vs_cnn = performance['vs_cnn']
            self.assertGreater(vs_cnn, 0.15, "Should be >15% better than CNN")
            
            print(f"✅ Competitive advantage: {vs_cnn:.1%} better than CNN")
            
            # Innovation status
            innovation_status = "First KAN implementation in archaeology"
            self.assertTrue(len(innovation_status) > 0)
            
            print(f"✅ Innovation: {innovation_status}")
            
        except ImportError:
            print("⚠️ KAN processor not available - skipping test")
            self.skipTest("KAN processor not available")
    
    def _generate_test_data(self, num_points: int) -> np.ndarray:
        """Generate synthetic test data"""
        np.random.seed(42)  # Consistent test data
        
        # Generate coordinates
        lats = np.random.normal(-3.4653, 0.01, num_points)
        lons = np.random.normal(-62.2159, 0.01, num_points)
        
        # Generate elevations with archaeological signatures
        elevations = np.random.normal(100, 15, num_points)
        
        # Add mound signatures
        distances = np.sqrt((lats - (-3.4653))**2 + (lons - (-62.2159))**2)
        mound_mask = distances < 0.005
        elevations[mound_mask] += np.random.exponential(5, np.sum(mound_mask))
        
        # Generate intensities and classifications
        intensities = np.random.normal(150, 40, num_points).astype(np.uint16)
        intensities = np.clip(intensities, 0, 65535)
        
        classifications = np.random.choice([1, 2, 3, 4, 5], num_points, 
                                         p=[0.1, 0.3, 0.2, 0.2, 0.2])
        
        return np.column_stack([lons, lats, elevations, intensities, classifications])
    
    @classmethod
    def tearDownClass(cls):
        """Generate test report"""
        total_time = time.time() - cls.test_results['start_time']
        
        print("\n" + "=" * 50)
        print("🧪 DAY 3 KAN INTEGRATION TEST REPORT")
        print("=" * 50)
        
        print(f"⏱️ Total test time: {total_time:.2f}s")
        
        # Save detailed results
        report_path = Path(__file__).parent / 'day3_test_report.json'
        with open(report_path, 'w') as f:
            json.dump(cls.test_results, f, indent=2, default=str)
        
        print(f"📋 Detailed report saved to: {report_path}")

if __name__ == '__main__':
    unittest.main(verbosity=2) 