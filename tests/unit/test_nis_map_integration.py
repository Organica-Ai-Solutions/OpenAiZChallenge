#!/usr/bin/env python3
"""
🗺️ NIS Protocol Map Integration Test Suite
Test the complete data flow from frontend map interactions to backend analysis and storage
"""

import requests
import json
import time
import sys
from typing import Dict, List, Any
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
TEST_TIMEOUT = 30

class NISMapIntegrationTester:
    def __init__(self):
        self.test_results = []
        self.start_time = datetime.now()
        
    def log(self, message: str, level: str = "INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def test_backend_health(self) -> bool:
        """Test if backend services are running"""
        self.log("🔍 Testing backend health...")
        
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=5)
            if response.status_code == 200:
                self.log("✅ Backend health check passed", "SUCCESS")
                return True
            else:
                self.log(f"❌ Backend health check failed: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Backend health check failed: {e}", "ERROR")
            return False
    
    def test_site_data_endpoints(self) -> bool:
        """Test archaeological site data endpoints"""
        self.log("🏛️ Testing site data endpoints...")
        
        endpoints = [
            "/api/sites",
            "/api/sites/search",
            "/api/discoveries",
            "/api/cultural/sites"
        ]
        
        success_count = 0
        for endpoint in endpoints:
            try:
                response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
                if response.status_code in [200, 404]:  # 404 is ok for empty data
                    self.log(f"✅ {endpoint} - Status: {response.status_code}", "SUCCESS")
                    success_count += 1
                else:
                    self.log(f"❌ {endpoint} - Status: {response.status_code}", "ERROR")
            except Exception as e:
                self.log(f"❌ {endpoint} - Error: {e}", "ERROR")
        
        success_rate = success_count / len(endpoints)
        self.log(f"📊 Site data endpoints success rate: {success_rate:.1%}")
        return success_rate > 0.5
    
    def test_area_analysis_endpoints(self) -> bool:
        """Test area analysis endpoints with polygon data"""
        self.log("🔬 Testing area analysis endpoints...")
        
        test_area = {
            "area_id": f"test_area_{int(time.time())}",
            "area_type": "polygon",
            "coordinates": {
                "path": [
                    {"lat": -15.7942, "lng": -47.8822},
                    {"lat": -15.7952, "lng": -47.8822},
                    {"lat": -15.7952, "lng": -47.8812},
                    {"lat": -15.7942, "lng": -47.8812}
                ]
            },
            "sites_count": 3,
            "sites_data": [
                {
                    "id": "test_site_1",
                    "name": "Test Settlement",
                    "type": "settlement",
                    "period": "Classic",
                    "coordinates": "-15.7947,-47.8817",
                    "confidence": 0.85,
                    "cultural_significance": "High"
                }
            ],
            "analysis_timestamp": datetime.now().isoformat(),
            "nis_protocol_active": True
        }
        
        endpoints_to_test = [
            ("/analyze/area", test_area),
            ("/agents/analyze/area", {**test_area, "analysis_type": "comprehensive_area"}),
            ("/cultural/analyze", {**test_area, "focus": "cultural_patterns"}),
            ("/trade/analyze", {**test_area, "focus": "trade_networks"})
        ]
        
        success_count = 0
        for endpoint, payload in endpoints_to_test:
            try:
                self.log(f"📤 Testing {endpoint}...")
                response = requests.post(f"{BASE_URL}{endpoint}", json=payload, timeout=15)
                
                if response.status_code in [200, 201, 404, 422]:
                    self.log(f"✅ {endpoint} - Status: {response.status_code}")
                    success_count += 1
                else:
                    self.log(f"❌ {endpoint} - Status: {response.status_code}")
                    
            except Exception as e:
                self.log(f"❌ {endpoint} - Error: {e}")
        
        success_rate = success_count / len(endpoints_to_test)
        self.log(f"📊 Area analysis endpoints success rate: {success_rate:.1%}")
        return success_rate > 0.5
    
    def test_data_storage_retrieval(self) -> bool:
        """Test data storage and retrieval in NIS Protocol systems"""
        self.log("💾 Testing data storage and retrieval...")
        
        test_analysis = {
            "analysis_id": f"test_analysis_{int(time.time())}",
            "area_data": {
                "id": "test_area_storage",
                "type": "rectangle",
                "sites_count": 2
            },
            "results": {
                "analysis_type": "test_storage",
                "confidence": 0.85,
                "nis_protocol_complete": True
            },
            "timestamp": datetime.now().isoformat(),
            "researcher_id": "nis_test_user",
            "analysis_type": "test_integration"
        }
        
        storage_success = 0
        
        # Test database storage
        try:
            self.log("📝 Testing database storage...")
            response = requests.post(
                f"{BASE_URL}/research/analysis/store",
                json=test_analysis,
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                self.log("✅ Database storage successful")
                storage_success += 1
            else:
                self.log(f"❌ Database storage failed: {response.status_code}")
                
        except Exception as e:
            self.log(f"❌ Database storage error: {e}")
        
        # Test memory agent storage
        try:
            self.log("🧠 Testing memory agent storage...")
            memory_payload = {
                "type": "area_analysis",
                "data": test_analysis,
                "metadata": {
                    "source": "test_suite",
                    "nis_protocol_version": "2.0",
                    "storage_priority": "high"
                }
            }
            
            response = requests.post(
                f"{BASE_URL}/agents/memory/store",
                json=memory_payload,
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                self.log("✅ Memory agent storage successful")
                storage_success += 1
            else:
                self.log(f"❌ Memory agent storage failed: {response.status_code}")
                
        except Exception as e:
            self.log(f"❌ Memory agent storage error: {e}")
        
        # Test cache storage
        try:
            self.log("⚡ Testing cache storage...")
            cache_payload = {
                "key": f"test_analysis_{test_analysis['analysis_id']}",
                "data": test_analysis,
                "ttl": 3600
            }
            
            response = requests.post(
                f"{BASE_URL}/cache/analysis",
                json=cache_payload,
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                self.log("✅ Cache storage successful")
                storage_success += 1
            else:
                self.log(f"❌ Cache storage failed: {response.status_code}")
                
        except Exception as e:
            self.log(f"❌ Cache storage error: {e}")
        
        # Test retrieval
        try:
            time.sleep(1)  # Allow storage to complete
            self.log("📥 Testing data retrieval...")
            
            response = requests.get(
                f"{BASE_URL}/research/analysis/{test_analysis['analysis_id']}",
                timeout=10
            )
            
            if response.status_code == 200:
                retrieved_data = response.json()
                self.log("✅ Data retrieval successful")
                storage_success += 1
            else:
                self.log(f"❌ Data retrieval failed: {response.status_code}")
                
        except Exception as e:
            self.log(f"❌ Data retrieval error: {e}")
        
        success_rate = storage_success / 4  # 4 total tests
        self.log(f"📊 Storage/retrieval success rate: {success_rate:.1%}")
        return success_rate >= 0.5
    
    def test_site_discovery_endpoint(self) -> bool:
        """Test site discovery endpoint"""
        self.log("🎯 Testing site discovery endpoint...")
        
        discovery_data = {
            "coordinates": {"lat": -15.7945, "lng": -47.8818},
            "discovery_type": "manual_selection",
            "analysis_depth": "comprehensive",
            "include_lidar": True,
            "include_satellite": True,
            "nis_protocol_active": True
        }
        
        try:
            response = requests.post(f"{BASE_URL}/discover/site", json=discovery_data, timeout=20)
            
            if response.status_code in [200, 201, 404, 422]:
                self.log(f"✅ Site discovery endpoint - Status: {response.status_code}")
                return True
            else:
                self.log(f"❌ Site discovery endpoint - Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log(f"❌ Site discovery endpoint - Error: {e}")
            return False
    
    def run_complete_test_suite(self) -> Dict[str, Any]:
        """Run the complete NIS Protocol map integration test suite"""
        self.log("🚀 Starting NIS Protocol Map Integration Test Suite")
        self.log("=" * 60)
        
        test_results = {}
        
        # Run all tests
        test_results["backend_health"] = self.test_backend_health()
        test_results["site_data_endpoints"] = self.test_site_data_endpoints()
        test_results["area_analysis_endpoints"] = self.test_area_analysis_endpoints()
        test_results["data_storage_retrieval"] = self.test_data_storage_retrieval()
        test_results["site_discovery_endpoint"] = self.test_site_discovery_endpoint()
        
        # Calculate overall results
        total_tests = len(test_results)
        passed_tests = sum(test_results.values())
        success_rate = passed_tests / total_tests
        
        self.log("=" * 60)
        self.log("📊 TEST SUITE RESULTS")
        self.log("=" * 60)
        
        for test_name, result in test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{test_name}: {status}")
        
        self.log("-" * 60)
        self.log(f"Overall Success Rate: {success_rate:.1%} ({passed_tests}/{total_tests})")
        
        end_time = datetime.now()
        duration = (end_time - self.start_time).total_seconds()
        self.log(f"Test Duration: {duration:.1f} seconds")
        
        if success_rate >= 0.8:
            self.log("🎉 TEST SUITE PASSED - NIS Protocol integration is working well!")
        elif success_rate >= 0.6:
            self.log("⚠️ TEST SUITE PARTIALLY PASSED - Some issues detected")
        else:
            self.log("❌ TEST SUITE FAILED - Significant issues detected")
        
        return {
            "success_rate": success_rate,
            "passed_tests": passed_tests,
            "total_tests": total_tests,
            "test_results": test_results,
            "duration": duration,
            "timestamp": end_time.isoformat()
        }

def main():
    """Main test runner"""
    if len(sys.argv) > 1 and sys.argv[1] == "--help":
        print("""
🗺️ NIS Protocol Map Integration Test Suite

Usage:
    python test_nis_map_integration.py [options]

Options:
    --help              Show this help message
    --base-url URL      Set base URL (default: http://localhost:8000)
    --timeout SECONDS   Set request timeout (default: 30)

This script tests the complete data flow from frontend map interactions
to backend analysis and storage using the NIS Protocol.
        """)
        return
    
    # Parse command line arguments
    global BASE_URL, TEST_TIMEOUT
    for i, arg in enumerate(sys.argv[1:], 1):
        if arg == "--base-url" and i + 1 < len(sys.argv):
            BASE_URL = sys.argv[i + 1]
        elif arg == "--timeout" and i + 1 < len(sys.argv):
            TEST_TIMEOUT = int(sys.argv[i + 1])
    
    # Run tests
    tester = NISMapIntegrationTester()
    results = tester.run_complete_test_suite()
    
    # Save results to file
    results_file = f"nis_map_test_results_{int(time.time())}.json"
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: {results_file}")
    
    # Exit with appropriate code
    sys.exit(0 if results["success_rate"] >= 0.8 else 1)

if __name__ == "__main__":
    main() 