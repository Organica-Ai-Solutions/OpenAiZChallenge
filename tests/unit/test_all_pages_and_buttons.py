#!/usr/bin/env python3
"""
Archaeological Discovery Platform - Complete System Test
Tests all pages, buttons, and backend connections
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"

def test_backend_endpoints():
    """Test all backend endpoints"""
    print("🔍 Testing Backend Endpoints...")
    
    endpoints = [
        ("/", "GET", None, "Root endpoint"),
        ("/system/health", "GET", None, "System health"),
        ("/agents/status", "GET", None, "Agent status"),
        ("/analyze", "POST", {"lat": -3.4653, "lon": -62.2159}, "Coordinate analysis"),
        ("/vision/analyze", "POST", {"coordinates": "-3.4653, -62.2159"}, "Vision analysis"),
        ("/research/sites", "GET", None, "Research sites")
    ]
    
    results = []
    for endpoint, method, data, description in endpoints:
        try:
            if method == "GET":
                response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=5)
            else:
                response = requests.post(
                    f"{BACKEND_URL}{endpoint}", 
                    json=data, 
                    headers={"Content-Type": "application/json"},
                    timeout=5
                )
            
            status = "✅ PASS" if response.status_code == 200 else f"❌ FAIL ({response.status_code})"
            results.append(f"  {status} {method} {endpoint} - {description}")
            
        except Exception as e:
            results.append(f"  ❌ FAIL {method} {endpoint} - {description} (Error: {str(e)})")
    
    for result in results:
        print(result)
    
    return results

def test_frontend_pages():
    """Test frontend page accessibility"""
    print("\n🌐 Testing Frontend Pages...")
    
    pages = [
        ("/", "Landing Page"),
        ("/archaeological-discovery", "Archaeological Discovery"),
        ("/agent", "AI Agent Network"),
        ("/satellite", "Satellite Monitoring"),
        ("/map", "Interactive Maps"),
        ("/analytics", "Data Analytics"),
        ("/chat", "Chat Interface"),
        ("/documentation", "Documentation")
    ]
    
    results = []
    for path, name in pages:
        try:
            response = requests.get(f"{FRONTEND_URL}{path}", timeout=10)
            status = "✅ PASS" if response.status_code == 200 else f"❌ FAIL ({response.status_code})"
            results.append(f"  {status} {path} - {name}")
        except Exception as e:
            results.append(f"  ❌ FAIL {path} - {name} (Error: {str(e)})")
    
    for result in results:
        print(result)
    
    return results

def test_api_integration():
    """Test API integration with real data"""
    print("\n🔗 Testing API Integration...")
    
    try:
        # Test coordinate analysis
        print("  Testing coordinate analysis...")
        response = requests.post(
            f"{BACKEND_URL}/analyze",
            json={"lat": -3.4653, "lon": -62.2159, "data_sources": ["satellite", "lidar"]},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            confidence = data.get("confidence", 0)
            pattern_type = data.get("pattern_type", "Unknown")
            finding_id = data.get("finding_id", "None")
            print(f"    ✅ Analysis successful: {pattern_type} ({confidence*100:.1f}% confidence)")
            print(f"    📍 Finding ID: {finding_id}")
        else:
            print(f"    ❌ Analysis failed: HTTP {response.status_code}")
        
        # Test vision analysis
        print("  Testing vision analysis...")
        response = requests.post(
            f"{BACKEND_URL}/vision/analyze",
            json={"coordinates": "-3.4653, -62.2159"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            features = len(data.get("detection_results", []))
            processing_time = data.get("metadata", {}).get("processing_time", 0)
            print(f"    ✅ Vision analysis successful: {features} features detected")
            print(f"    ⏱️ Processing time: {processing_time}s")
        else:
            print(f"    ❌ Vision analysis failed: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"    ❌ API integration test failed: {str(e)}")

def test_system_health():
    """Test overall system health"""
    print("\n💚 Testing System Health...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/system/health", timeout=5)
        if response.status_code == 200:
            health = response.json()
            print(f"  ✅ System Status: {health.get('status', 'Unknown')}")
            
            services = health.get('services', {})
            for service, status in services.items():
                emoji = "✅" if status == "online" else "❌"
                print(f"    {emoji} {service}: {status}")
                
            data_sources = health.get('data_sources', {})
            if data_sources:
                print("  📊 Data Sources:")
                for source, status in data_sources.items():
                    emoji = "✅" if status == "online" else "❌"
                    print(f"    {emoji} {source}: {status}")
        else:
            print(f"  ❌ Health check failed: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"  ❌ Health check error: {str(e)}")

def generate_report():
    """Generate comprehensive test report"""
    print("\n" + "="*60)
    print("🏛️ ARCHAEOLOGICAL DISCOVERY PLATFORM - SYSTEM TEST REPORT")
    print("="*60)
    print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Backend URL: {BACKEND_URL}")
    print(f"🖥️ Frontend URL: {FRONTEND_URL}")
    print("="*60)
    
    # Run all tests
    backend_results = test_backend_endpoints()
    frontend_results = test_frontend_pages()
    test_api_integration()
    test_system_health()
    
    # Summary
    print("\n📋 SUMMARY:")
    backend_pass = len([r for r in backend_results if "✅ PASS" in r])
    backend_total = len(backend_results)
    frontend_pass = len([r for r in frontend_results if "✅ PASS" in r])
    frontend_total = len(frontend_results)
    
    print(f"  Backend Endpoints: {backend_pass}/{backend_total} passing")
    print(f"  Frontend Pages: {frontend_pass}/{frontend_total} accessible")
    
    overall_health = "🟢 HEALTHY" if (backend_pass == backend_total and frontend_pass == frontend_total) else "🟡 PARTIAL" if (backend_pass > 0 and frontend_pass > 0) else "🔴 CRITICAL"
    print(f"  Overall Status: {overall_health}")
    
    print("\n🎯 RECOMMENDATIONS:")
    if backend_pass < backend_total:
        print("  - Check backend service status and restart if needed")
    if frontend_pass < frontend_total:
        print("  - Verify frontend build and Next.js server status")
    if backend_pass == backend_total and frontend_pass == frontend_total:
        print("  - All systems operational! ✨")
    
    print("\n🚀 Archaeological Discovery Platform by Organica AI Solutions")
    print("   https://organicaai.com")
    print("="*60)

if __name__ == "__main__":
    generate_report() 