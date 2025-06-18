#!/usr/bin/env python3
"""
Comprehensive test script for the NIS Protocol Satellite Monitoring System
Tests all components including frontend accessibility, backend connectivity, and system health
"""

import requests
import json
import time
from datetime import datetime

def test_frontend_accessibility():
    """Test if frontend pages are accessible"""
    print("🌐 Testing Frontend Accessibility...")
    
    endpoints = {
        "Homepage": "http://localhost:3000/",
        "Satellite Monitoring": "http://localhost:3000/satellite",
        "Agent Interface": "http://localhost:3000/agent",
        "Interactive Map": "http://localhost:3000/map",
        "Chat Interface": "http://localhost:3000/chat",
        "Analytics Dashboard": "http://localhost:3000/analytics"
    }
    
    results = {}
    for name, url in endpoints.items():
        try:
            response = requests.get(url, timeout=10)
            status = "✅ PASS" if response.status_code == 200 else f"❌ FAIL ({response.status_code})"
            results[name] = {"status": status, "response_time": response.elapsed.total_seconds()}
            print(f"  {name}: {status} ({response.elapsed.total_seconds():.2f}s)")
        except Exception as e:
            results[name] = {"status": f"❌ ERROR: {str(e)}", "response_time": None}
            print(f"  {name}: ❌ ERROR: {str(e)}")
    
    return results

def test_backend_connectivity():
    """Test backend API endpoints"""
    print("\n🔗 Testing Backend Connectivity...")
    
    endpoints = {
        "API Documentation": "http://localhost:8000/docs",
        "OpenAPI Schema": "http://localhost:8000/openapi.json"
    }
    
    results = {}
    for name, url in endpoints.items():
        try:
            response = requests.get(url, timeout=10)
            status = "✅ PASS" if response.status_code == 200 else f"❌ FAIL ({response.status_code})"
            results[name] = {"status": status, "response_time": response.elapsed.total_seconds()}
            print(f"  {name}: {status} ({response.elapsed.total_seconds():.2f}s)")
        except Exception as e:
            results[name] = {"status": f"❌ ERROR: {str(e)}", "response_time": None}
            print(f"  {name}: ❌ ERROR: {str(e)}")
    
    return results

def test_satellite_features():
    """Test satellite-specific page features"""
    print("\n🛰️ Testing Satellite Features...")
    
    try:
        response = requests.get("http://localhost:3000/satellite", timeout=10)
        content = response.text
        
        features_to_check = [
            "Real-time satellite feeds",
            "automated change detection", 
            "weather correlation",
            "soil analysis",
            "System Health Status",
            "Satellite Monitoring System"
        ]
        
        results = {}
        for feature in features_to_check:
            found = feature in content
            status = "✅ FOUND" if found else "❌ MISSING"
            results[feature] = found
            print(f"  {feature}: {status}")
            
        return results
        
    except Exception as e:
        print(f"  ❌ ERROR: {str(e)}")
        return {"error": str(e)}

def test_container_health():
    """Test Docker container health"""
    print("\n🐳 Testing Container Health...")
    
    try:
        import subprocess
        result = subprocess.run(['docker-compose', 'ps'], capture_output=True, text=True, cwd='.')
        
        if result.returncode == 0:
            lines = result.stdout.strip().split('\n')
            container_status = {}
            
            for line in lines[1:]:  # Skip header
                if line.strip():
                    parts = line.split()
                    if len(parts) >= 4:
                        container_name = parts[0]
                        status = "Up" in ' '.join(parts)
                        container_status[container_name] = "✅ RUNNING" if status else "❌ STOPPED"
                        print(f"  {container_name}: {'✅ RUNNING' if status else '❌ STOPPED'}")
            
            return container_status
        else:
            print(f"  ❌ ERROR: {result.stderr}")
            return {"error": result.stderr}
            
    except Exception as e:
        print(f"  ❌ ERROR: {str(e)}")
        return {"error": str(e)}

def generate_test_report(frontend_results, backend_results, satellite_results, container_results):
    """Generate a comprehensive test report"""
    print("\n📊 COMPREHENSIVE TEST REPORT")
    print("=" * 60)
    print(f"Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Summary
    frontend_pass = sum(1 for r in frontend_results.values() if "✅" in str(r.get('status', '')))
    backend_pass = sum(1 for r in backend_results.values() if "✅" in str(r.get('status', '')))
    satellite_pass = sum(1 for r in satellite_results.values() if r is True)
    container_pass = sum(1 for r in container_results.values() if "✅" in str(r))
    
    total_tests = len(frontend_results) + len(backend_results) + len(satellite_results) + len(container_results)
    total_pass = frontend_pass + backend_pass + satellite_pass + container_pass
    
    print(f"Overall Status: {'✅ HEALTHY' if total_pass >= total_tests * 0.8 else '⚠️ NEEDS ATTENTION'}")
    print(f"Tests Passed: {total_pass}/{total_tests} ({(total_pass/total_tests)*100:.1f}%)")
    print()
    
    # Detailed Results
    print("DETAILED RESULTS:")
    print("-" * 40)
    
    print(f"Frontend Tests: {frontend_pass}/{len(frontend_results)} passed")
    for name, result in frontend_results.items():
        print(f"  • {name}: {result.get('status', 'Unknown')}")
    
    print(f"\nBackend Tests: {backend_pass}/{len(backend_results)} passed")
    for name, result in backend_results.items():
        print(f"  • {name}: {result.get('status', 'Unknown')}")
    
    print(f"\nSatellite Features: {satellite_pass}/{len(satellite_results)} found")
    for feature, found in satellite_results.items():
        status = "✅ FOUND" if found else "❌ MISSING"
        print(f"  • {feature}: {status}")
    
    print(f"\nContainer Health: {container_pass}/{len(container_results)} running")
    for container, status in container_results.items():
        print(f"  • {container}: {status}")
    
    # Recommendations
    print("\nRECOMMENDations:")
    print("-" * 40)
    
    if total_pass == total_tests:
        print("🎉 All systems operational! The NIS Protocol satellite monitoring system is fully functional.")
    else:
        if frontend_pass < len(frontend_results):
            print("⚠️ Some frontend pages may need attention.")
        if backend_pass < len(backend_results):
            print("⚠️ Backend API connectivity issues detected.")
        if satellite_pass < len(satellite_results):
            print("⚠️ Some satellite features may not be properly displayed.")
        if container_pass < len(container_results):
            print("⚠️ Some Docker containers are not running properly.")
    
    print("\n" + "=" * 60)

def main():
    """Run all tests and generate report"""
    print("🚀 NIS PROTOCOL SATELLITE MONITORING SYSTEM TEST")
    print("=" * 60)
    print("Testing all components of the satellite monitoring system...")
    print()
    
    # Run all tests
    frontend_results = test_frontend_accessibility()
    backend_results = test_backend_connectivity()
    satellite_results = test_satellite_features()
    container_results = test_container_health()
    
    # Generate comprehensive report
    generate_test_report(frontend_results, backend_results, satellite_results, container_results)

if __name__ == "__main__":
    main() 