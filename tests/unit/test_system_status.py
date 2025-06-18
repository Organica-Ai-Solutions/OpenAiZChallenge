#!/usr/bin/env python3
"""
Test the complete Archaeological Discovery Platform system status
Verifies all backend endpoints work and that 404 errors are resolved
"""

import requests
import json
import time
import sys
from datetime import datetime

def test_backend_endpoints():
    """Test all backend endpoints"""
    base_url = "http://localhost:8000"
    
    endpoints = [
        ("GET", "/", "Root endpoint"),
        ("GET", "/system/health", "System health"),
        ("GET", "/agents/status", "Agent status"),
        ("POST", "/analyze", "Coordinate analysis", {"lat": -3.4653, "lon": -62.2159}),
        ("POST", "/vision/analyze", "Vision analysis", {"coordinates": "-3.4653, -62.2159"}),
        ("GET", "/research/sites", "Research sites")
    ]
    
    print("🔧 Testing Backend Endpoints")
    print("=" * 50)
    
    passed = 0
    total = len(endpoints)
    
    for endpoint_data in endpoints:
        method = endpoint_data[0]
        path = endpoint_data[1]
        description = endpoint_data[2]
        data = endpoint_data[3] if len(endpoint_data) > 3 else None
        
        try:
            if method == "GET":
                response = requests.get(f"{base_url}{path}", timeout=10)
            else:  # POST
                response = requests.post(
                    f"{base_url}{path}", 
                    json=data,
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
            
            if response.status_code == 200:
                print(f"✅ {method} {path} - {description}")
                passed += 1
            else:
                print(f"❌ {method} {path} - {description} (Status: {response.status_code})")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ {method} {path} - {description} (Error: {e})")
    
    print(f"\nBackend Result: {passed}/{total} endpoints passing")
    return passed == total

def test_frontend_pages():
    """Test frontend pages accessibility"""
    base_url = "http://localhost:3000"
    
    pages = [
        ("/", "Landing page"),
        ("/archaeological-discovery", "Archaeological discovery"),
        ("/agent", "AI agent network"),
        ("/satellite", "Satellite monitoring"),
        ("/map", "Interactive maps"),
        ("/analytics", "Data analytics"),
        ("/chat", "Chat interface"),
        ("/documentation", "Documentation")
    ]
    
    print("\n🌐 Testing Frontend Pages")
    print("=" * 50)
    
    passed = 0
    total = len(pages)
    
    for path, description in pages:
        try:
            response = requests.get(f"{base_url}{path}", timeout=15)
            if response.status_code == 200:
                print(f"✅ {path} - {description}")
                passed += 1
            else:
                print(f"❌ {path} - {description} (Status: {response.status_code})")
        except requests.exceptions.RequestException as e:
            print(f"❌ {path} - {description} (Error: {e})")
    
    print(f"\nFrontend Result: {passed}/{total} pages accessible")
    return passed == total

def test_specific_analysis():
    """Test specific coordinate analysis"""
    print("\n🔍 Testing Real Archaeological Analysis")
    print("=" * 50)
    
    try:
        response = requests.post(
            "http://localhost:8000/analyze",
            json={
                "lat": -3.4653,
                "lon": -62.2159,
                "data_sources": ["satellite", "lidar", "historical"]
            },
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            confidence = data.get('confidence', 0)
            pattern_type = data.get('pattern_type', 'Unknown')
            print(f"✅ Analysis completed successfully")
            print(f"   📍 Coordinates: -3.4653, -62.2159")
            print(f"   🎯 Confidence: {confidence*100:.1f}%")
            print(f"   🏛️ Pattern: {pattern_type}")
            return True
        else:
            print(f"❌ Analysis failed (Status: {response.status_code})")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Analysis failed (Error: {e})")
        return False

def test_vision_analysis():
    """Test vision analysis"""
    print("\n👁️ Testing Vision Analysis")
    print("=" * 50)
    
    try:
        response = requests.post(
            "http://localhost:8000/vision/analyze",
            json={"coordinates": "-3.4653, -62.2159"},
            timeout=20
        )
        
        if response.status_code == 200:
            data = response.json()
            features = len(data.get('detection_results', []))
            processing_time = data.get('metadata', {}).get('total_processing_time', 'Unknown')
            print(f"✅ Vision analysis completed")
            print(f"   🔍 Features detected: {features}")
            print(f"   ⏱️ Processing time: {processing_time}")
            return True
        else:
            print(f"❌ Vision analysis failed (Status: {response.status_code})")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Vision analysis failed (Error: {e})")
        return False

def main():
    """Run complete system test"""
    print("🏛️ Archaeological Discovery Platform - System Status Test")
    print("=" * 70)
    print(f"🕐 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test backend
    backend_ok = test_backend_endpoints()
    
    # Test frontend (give it time to load if needed)
    print("\n⏳ Waiting for frontend to be ready...")
    time.sleep(5)
    frontend_ok = test_frontend_pages()
    
    # Test specific functionality
    analysis_ok = test_specific_analysis()
    vision_ok = test_vision_analysis()
    
    # Summary
    print("\n📊 SYSTEM STATUS SUMMARY")
    print("=" * 70)
    print(f"🔧 Backend Endpoints: {'✅ OPERATIONAL' if backend_ok else '❌ ISSUES'}")
    print(f"🌐 Frontend Pages: {'✅ ACCESSIBLE' if frontend_ok else '❌ ISSUES'}")
    print(f"🔍 Archaeological Analysis: {'✅ WORKING' if analysis_ok else '❌ FAILED'}")
    print(f"👁️ Vision Analysis: {'✅ WORKING' if vision_ok else '❌ FAILED'}")
    
    all_working = backend_ok and frontend_ok and analysis_ok and vision_ok
    
    if all_working:
        print(f"\n🎉 RESULT: FULLY OPERATIONAL SYSTEM")
        print("   All components working correctly - no 404 errors detected!")
        return 0
    else:
        print(f"\n⚠️ RESULT: SYSTEM HAS ISSUES")
        print("   Some components need attention")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 