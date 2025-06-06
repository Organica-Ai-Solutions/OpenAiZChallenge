#!/usr/bin/env python3
"""
Test script to verify Analysis page and Agent integration
"""

import requests
import json
import time
from typing import Dict, Any

def test_backend_health():
    """Test if backend is running and healthy"""
    try:
        response = requests.get('http://localhost:8000/system/health', timeout=5)
        if response.status_code == 200:
            print("✅ Backend health check: PASSED")
            return True
        else:
            print(f"❌ Backend health check: FAILED (status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Backend health check: FAILED (error: {e})")
        return False

def test_agents_endpoint():
    """Test if agents endpoint is working"""
    try:
        response = requests.get(
            'http://localhost:8000/agents/agents',
            timeout=10
        )
        if response.status_code == 200:
            print("✅ Agents endpoint: PASSED")
            return True
        else:
            print(f"❌ Agents endpoint: FAILED (status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Agents endpoint: FAILED (error: {e})")
        return False

def test_vision_analysis():
    """Test vision analysis endpoint"""
    try:
        response = requests.post(
            'http://localhost:8000/vision/analyze',
            json={
                'coordinates': '5.1542, -73.7792',
                'analysis_type': 'archaeological_discovery'
            },
            timeout=15
        )
        if response.status_code == 200:
            print("✅ Vision analysis endpoint: PASSED")
            return True
        else:
            print(f"❌ Vision analysis endpoint: FAILED (status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Vision analysis endpoint: FAILED (error: {e})")
        return False

def test_analyze_endpoint():
    """Test the /analyze endpoint with correct data format"""
    try:
        response = requests.post(
            'http://localhost:8000/analyze',
            json={
                "lat": 5.1542,
                "lon": -73.7792
            },
            timeout=15
        )
        if response.status_code == 200:
            print("✅ Analyze endpoint: PASSED")
            return True
        else:
            print(f"❌ Analyze endpoint: FAILED (status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Analyze endpoint: FAILED (error: {e})")
        return False

def test_frontend_analysis_page():
    """Test if frontend analysis page is accessible"""
    try:
        response = requests.get('http://localhost:3000/analysis', timeout=10)
        if response.status_code == 200:
            print("✅ Frontend analysis page: ACCESSIBLE")
            return True
        else:
            print(f"❌ Frontend analysis page: FAILED (status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Frontend analysis page: FAILED (error: {e})")
        return False

def test_frontend_chat_page():
    """Test if frontend chat page is accessible"""
    try:
        response = requests.get('http://localhost:3000/chat', timeout=10)
        if response.status_code == 200:
            print("✅ Frontend chat page: ACCESSIBLE")
            return True
        else:
            print(f"❌ Frontend chat page: FAILED (status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Frontend chat page: FAILED (error: {e})")
        return False

def test_frontend_map_page():
    """Test if frontend map page is accessible"""
    try:
        response = requests.get('http://localhost:3000/map', timeout=10)
        if response.status_code == 200:
            print("✅ Frontend map page: ACCESSIBLE")
            return True
        else:
            print(f"❌ Frontend map page: FAILED (status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Frontend map page: FAILED (error: {e})")
        return False

def main():
    """Run all integration tests"""
    print("🧪 Testing Analysis Page and Agent Integration")
    print("=" * 50)
    
    tests = [
        ("Backend Health", test_backend_health),
        ("Agents Endpoint", test_agents_endpoint),
        ("Vision Analysis", test_vision_analysis),
        ("Analyze Endpoint", test_analyze_endpoint),
        ("Frontend Analysis Page", test_frontend_analysis_page),
        ("Frontend Chat Page", test_frontend_chat_page),
        ("Frontend Map Page", test_frontend_map_page),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n🔍 Testing {test_name}...")
        result = test_func()
        results.append((test_name, result))
        time.sleep(1)  # Brief pause between tests
    
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:<25} {status}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! Analysis page and agents are fully integrated.")
    elif passed >= total * 0.8:
        print("⚠️  Most tests passed. Minor issues may exist.")
    else:
        print("🚨 Multiple failures detected. Check backend and frontend services.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 