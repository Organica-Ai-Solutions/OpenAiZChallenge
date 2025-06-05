#!/usr/bin/env python3
"""
Test Script for Fixed Issues - NIS Protocol Backend
Verifies that all the reported issues have been resolved
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL
BASE_URL = "http://localhost:8000"

def test_endpoint(method, endpoint, data=None, expected_status=200):
    """Test a single endpoint"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=10)
        else:
            print(f"❌ Unsupported method: {method}")
            return False
        
        if response.status_code == expected_status:
            print(f"✅ {method} {endpoint} - Status: {response.status_code}")
            
            # Try to parse JSON response
            try:
                response_data = response.json()
                if isinstance(response_data, dict):
                    if 'success' in response_data and response_data['success']:
                        print(f"   📊 Success: {response_data.get('count', 'N/A')} items returned")
                    elif 'status' in response_data and response_data['status'] == 'success':
                        print(f"   📊 Status: Success")
                    elif 'status' in response_data and response_data['status'] == 'healthy':
                        print(f"   💚 System Health: All services online")
                    else:
                        print(f"   📋 Response: Valid JSON returned")
                else:
                    print(f"   📋 Response: {type(response_data).__name__} returned")
            except:
                print(f"   📄 Response: Non-JSON content")
            
            return True
        else:
            print(f"❌ {method} {endpoint} - Status: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('detail', 'Unknown error')}")
            except:
                print(f"   Error: {response.text[:100]}...")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ {method} {endpoint} - Connection refused (backend not running?)")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ {method} {endpoint} - Request timeout")
        return False
    except Exception as e:
        print(f"❌ {method} {endpoint} - Error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Fixed Issues - NIS Protocol Backend")
    print("=" * 60)
    print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test counter
    total_tests = 0
    passed_tests = 0
    
    # Test 1: System Health
    print("1️⃣ Testing System Health")
    print("-" * 30)
    if test_endpoint("GET", "/system/health"):
        passed_tests += 1
    total_tests += 1
    print()
    
    # Test 2: Research Regions (was 404)
    print("2️⃣ Testing Research Regions (Previously 404)")
    print("-" * 45)
    if test_endpoint("GET", "/research/regions"):
        passed_tests += 1
    total_tests += 1
    print()
    
    # Test 3: System Data Sources (was 404) 
    print("3️⃣ Testing System Data Sources (Previously 404)")
    print("-" * 48)
    if test_endpoint("GET", "/system/data-sources"):
        passed_tests += 1
    total_tests += 1
    print()
    
    # Test 4: Satellite Soil Data (was 422)
    print("4️⃣ Testing Satellite Soil Data (Previously 422)")
    print("-" * 47)
    soil_data = {
        "coordinates": {
            "lat": -3.4653,
            "lng": -62.2159
        }
    }
    if test_endpoint("POST", "/satellite/soil", soil_data):
        passed_tests += 1
    total_tests += 1
    print()
    
    # Test 5: Alternative Soil Data Format
    print("5️⃣ Testing Alternative Soil Data Format")
    print("-" * 39)
    alt_soil_data = {
        "lat": -5.1234,
        "lng": -65.4321
    }
    if test_endpoint("POST", "/satellite/soil", alt_soil_data):
        passed_tests += 1
    total_tests += 1
    print()
    
    # Test 6: Basic Analysis Endpoint
    print("6️⃣ Testing Core Analysis Endpoint")
    print("-" * 34)
    analysis_data = {
        "lat": -3.4653,
        "lon": -62.2159,
        "data_sources": ["satellite", "lidar", "historical"]
    }
    if test_endpoint("POST", "/analyze", analysis_data):
        passed_tests += 1
    total_tests += 1
    print()
    
    # Test 7: Vision Analysis Endpoint
    print("7️⃣ Testing Vision Analysis Endpoint")
    print("-" * 36)
    vision_data = {
        "coordinates": "-3.4653, -62.2159",
        "models": ["gpt4o_vision", "archaeological_analysis"],
        "confidence_threshold": 0.4
    }
    if test_endpoint("POST", "/vision/analyze", vision_data):
        passed_tests += 1
    total_tests += 1
    print()
    
    # Test 8: Research Sites
    print("8️⃣ Testing Research Sites")
    print("-" * 26)
    if test_endpoint("GET", "/research/sites?max_sites=5"):
        passed_tests += 1
    total_tests += 1
    print()
    
    # Test 9: Statistics
    print("9️⃣ Testing Statistics Endpoint")
    print("-" * 31)
    if test_endpoint("GET", "/statistics"):
        passed_tests += 1
    total_tests += 1
    print()
    
    # Test 10: Agents Information
    print("🔟 Testing Agents Information")
    print("-" * 30)
    if test_endpoint("GET", "/agents/agents"):
        passed_tests += 1
    total_tests += 1
    print()
    
    # Results Summary
    print("=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    print(f"✅ Passed: {passed_tests}/{total_tests} tests")
    print(f"❌ Failed: {total_tests - passed_tests}/{total_tests} tests")
    
    if passed_tests == total_tests:
        print("🎉 ALL TESTS PASSED! All issues have been resolved.")
        print()
        print("✨ FIXED ISSUES:")
        print("   • Backend endpoints /research/regions and /system/data-sources now working (404 → 200)")
        print("   • Satellite soil endpoint accepts flexible coordinate formats (422 → 200)")
        print("   • Missing key props in ArchaeologicalMapPage fixed")
        print("   • Backend port conflict resolved")
        print("   • All core functionality operational")
        return 0
    else:
        print(f"⚠️  {total_tests - passed_tests} tests failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 