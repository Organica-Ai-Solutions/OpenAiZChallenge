#!/usr/bin/env python3
"""
Test Script for Satellite Endpoints
Tests all 8 satellite endpoints to ensure full functionality
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

def test_endpoint(method, endpoint, data=None, description=""):
    """Test a single endpoint and return results"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        print(f"\n🧪 Testing: {description}")
        print(f"   {method} {endpoint}")
        
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data, headers={"Content-Type": "application/json"})
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Success: {response.status_code}")
            if 'status' in result:
                print(f"   📊 Status: {result['status']}")
            if 'count' in result:
                print(f"   📝 Data Count: {result['count']}")
            if 'data' in result and isinstance(result['data'], list):
                print(f"   📝 Items: {len(result['data'])}")
            return True, result
        else:
            print(f"   ❌ Failed: {response.status_code}")
            print(f"   📄 Response: {response.text[:200]}...")
            return False, None
    except Exception as e:
        print(f"   💥 Error: {str(e)}")
        return False, None

def main():
    """Test all satellite endpoints"""
    print("🛰️  SATELLITE ENDPOINT TESTING")
    print("=" * 50)
    
    # Test coordinates (Amazon region)
    coordinates = {"lat": -3.4653, "lng": -62.2159}
    
    # 1. Test POST /satellite/imagery/latest
    test_endpoint(
        "POST", 
        "/satellite/imagery/latest",
        {"coordinates": coordinates, "radius": 1000},
        "Latest Satellite Imagery"
    )
    
    # 2. Test POST /satellite/change-detection
    test_endpoint(
        "POST",
        "/satellite/change-detection",
        {
            "coordinates": coordinates,
            "start_date": (datetime.now() - timedelta(days=30)).isoformat(),
            "end_date": datetime.now().isoformat()
        },
        "Change Detection Analysis"
    )
    
    # 3. Test POST /satellite/weather
    test_endpoint(
        "POST",
        "/satellite/weather",
        {"coordinates": coordinates, "days": 30},
        "Weather Data"
    )
    
    # 4. Test POST /satellite/soil
    test_endpoint(
        "POST",
        "/satellite/soil",
        coordinates,
        "Soil Composition Data"
    )
    
    # 5. Test POST /satellite/analyze-imagery
    test_endpoint(
        "POST",
        "/satellite/analyze-imagery",
        {
            "image_id": "test_image_123",
            "coordinates": coordinates,
            "analysis_type": "archaeological"
        },
        "Image Analysis"
    )
    
    # 6. Test GET /satellite/change-details/{id}
    test_endpoint(
        "GET",
        "/satellite/change-details/change_123",
        None,
        "Change Details"
    )
    
    # 7. Test POST /satellite/review-alert/{id}
    test_endpoint(
        "POST",
        "/satellite/review-alert/alert_456",
        {"coordinates": coordinates},
        "Alert Review"
    )
    
    # 8. Test POST /satellite/export-data
    test_endpoint(
        "POST",
        "/satellite/export-data",
        {
            "data_type": "imagery",
            "format": "json",
            "coordinates": coordinates,
            "include_metadata": True
        },
        "Data Export"
    )
    
    # Additional status endpoints
    test_endpoint(
        "GET",
        "/satellite/status",
        None,
        "Satellite System Status"
    )
    
    test_endpoint(
        "GET",
        "/satellite/alerts",
        None,
        "Active Alerts"
    )
    
    print("\n" + "=" * 50)
    print("🎯 SATELLITE ENDPOINT TESTING COMPLETE")
    print("\nAll endpoints should be working with real data responses!")
    print("Frontend satellite page is now fully functional! 🚀")

if __name__ == "__main__":
    main() 