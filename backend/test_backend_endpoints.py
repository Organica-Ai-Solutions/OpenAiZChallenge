#!/usr/bin/env python3

import requests
import json

def test_endpoint(method, url, data=None):
    """Test an endpoint and return the result."""
    try:
        if method == 'GET':
            response = requests.get(url, timeout=5)
        elif method == 'POST':
            response = requests.post(url, json=data, timeout=5)
        
        print(f"\n🧪 Testing {method} {url}")
        print(f"📊 Status Code: {response.status_code}")
        print(f"📦 Response: {response.text[:200]}...")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Error testing {url}: {e}")
        return False

def main():
    base_url = "http://localhost:8003"
    
    print("🚀 Testing NIS Protocol Backend Endpoints")
    print("=" * 50)
    
    # Test GET endpoints
    get_endpoints = [
        "/",
        "/system/health", 
        "/statistics"
    ]
    
    for endpoint in get_endpoints:
        test_endpoint('GET', f"{base_url}{endpoint}")
    
    # Test POST endpoints
    post_endpoints = [
        ("/analyze", {"coordinates": [-3.4653, -62.2159]}),
        ("/analysis/store", {"coordinates": {"lat": 5.155006, "lng": -73.779222}, "test": True}),
        ("/agents/divine-analysis-all-sites", {})
    ]
    
    for endpoint, data in post_endpoints:
        test_endpoint('POST', f"{base_url}{endpoint}", data)

if __name__ == "__main__":
    main() 