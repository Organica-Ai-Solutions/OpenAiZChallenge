#!/usr/bin/env python3
"""
Comprehensive Backend Endpoint Testing
Maps all available endpoints and identifies issues
"""

import requests
import json
import time
from typing import Dict, Any, List, Tuple

BASE_URL = "http://localhost:8000"

def test_endpoint(method: str, endpoint: str, data: Dict = None, timeout: int = 10) -> Tuple[bool, int, str]:
    """Test an endpoint with specified method"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method.upper() == "GET":
            response = requests.get(url, timeout=timeout)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, timeout=timeout)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, timeout=timeout)
        elif method.upper() == "DELETE":
            response = requests.delete(url, timeout=timeout)
        else:
            return False, 0, f"Unsupported method: {method}"
        
        return True, response.status_code, response.text[:500] if response.text else ""
    except Exception as e:
        return False, 0, str(e)

def discover_endpoints() -> List[str]:
    """Discover available endpoints from root"""
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if "endpoints" in data:
                return data["endpoints"]
    except:
        pass
    
    # Fallback list from documentation/logs
    return [
        "/",
        "/analyze", 
        "/vision/analyze",
        "/research/sites",
        "/statistics",
        "/agents/agents",
        "/system/health",
        "/agents/status"
    ]

def main():
    """Run comprehensive backend testing"""
    print("🔍 COMPREHENSIVE BACKEND ENDPOINT TESTING")
    print("=" * 60)
    
    # Discover endpoints
    print("🔍 Discovering available endpoints...")
    endpoints = discover_endpoints()
    print(f"✅ Found {len(endpoints)} endpoints: {endpoints}")
    
    # Test methods for each endpoint
    methods_to_test = ["GET", "POST"]
    
    results = {}
    
    print(f"\n📊 Testing {len(endpoints)} endpoints with {len(methods_to_test)} methods each...")
    print("=" * 60)
    
    for endpoint in endpoints:
        results[endpoint] = {}
        
        print(f"\n🔍 Testing endpoint: {endpoint}")
        print("-" * 40)
        
        for method in methods_to_test:
            # Prepare test data for POST requests
            test_data = None
            if method == "POST":
                if "vision" in endpoint:
                    test_data = {
                        "coordinates": "5.1542, -73.7792",
                        "analysis_type": "archaeological_discovery"
                    }
                elif "agents" in endpoint:
                    test_data = {
                        "action": "test",
                        "data": {"test": True}
                    }
                elif "analyze" in endpoint:
                    test_data = {
                        "query": "test analysis",
                        "coordinates": "5.1542, -73.7792"
                    }
                else:
                    test_data = {"test": True}
            
            success, status_code, response_text = test_endpoint(method, endpoint, test_data)
            
            if success:
                if status_code == 200:
                    status = "✅ SUCCESS"
                elif status_code == 405:
                    status = "⚠️  METHOD NOT ALLOWED"
                elif status_code == 404:
                    status = "❌ NOT FOUND"
                elif status_code == 422:
                    status = "⚠️  VALIDATION ERROR"
                elif status_code >= 500:
                    status = "🚨 SERVER ERROR"
                else:
                    status = f"⚠️  STATUS {status_code}"
            else:
                status = "❌ CONNECTION FAILED"
                status_code = 0
            
            results[endpoint][method] = {
                "success": success,
                "status_code": status_code,
                "response": response_text[:200] if response_text else "",
                "status": status
            }
            
            print(f"  {method:<6} {status} ({status_code})")
            if response_text and len(response_text) > 0 and status_code == 200:
                preview = response_text[:100].replace('\n', ' ')
                print(f"         Response: {preview}...")
            
            time.sleep(0.5)  # Rate limiting
    
    # Summary Report
    print("\n" + "=" * 60)
    print("📊 ENDPOINT SUMMARY REPORT")
    print("=" * 60)
    
    working_endpoints = []
    broken_endpoints = []
    method_issues = []
    
    for endpoint, methods in results.items():
        working_methods = []
        for method, result in methods.items():
            if result["status_code"] == 200:
                working_methods.append(method)
            elif result["status_code"] == 405:
                method_issues.append(f"{endpoint} - {method} not allowed")
        
        if working_methods:
            working_endpoints.append(f"{endpoint} ({', '.join(working_methods)})")
        else:
            broken_endpoints.append(endpoint)
    
    print(f"\n✅ WORKING ENDPOINTS ({len(working_endpoints)}):")
    for endpoint in working_endpoints:
        print(f"  • {endpoint}")
    
    if method_issues:
        print(f"\n⚠️  METHOD ISSUES ({len(method_issues)}):")
        for issue in method_issues:
            print(f"  • {issue}")
    
    if broken_endpoints:
        print(f"\n❌ BROKEN ENDPOINTS ({len(broken_endpoints)}):")
        for endpoint in broken_endpoints:
            print(f"  • {endpoint}")
    
    # Detailed API Documentation
    print(f"\n📚 API ENDPOINT DOCUMENTATION")
    print("=" * 60)
    
    for endpoint, methods in results.items():
        print(f"\n🔗 {endpoint}")
        for method, result in methods.items():
            if result["status_code"] == 200:
                print(f"  ✅ {method} - Working")
                if result["response"]:
                    try:
                        response_json = json.loads(result["response"])
                        if isinstance(response_json, dict):
                            keys = list(response_json.keys())[:5]
                            print(f"     Returns: {keys}")
                        elif isinstance(response_json, list) and len(response_json) > 0:
                            print(f"     Returns: Array of {len(response_json)} items")
                    except:
                        pass
            elif result["status_code"] == 405:
                print(f"  ⚠️  {method} - Method not allowed")
            elif result["status_code"] != 0:
                print(f"  ❌ {method} - Status {result['status_code']}")
    
    # Frontend Integration Issues
    print(f"\n🔧 FRONTEND INTEGRATION ISSUES")
    print("=" * 60)
    
    issues_found = []
    
    # Check specific endpoints the frontend needs
    critical_endpoints = [
        ("/system/health", "GET"),
        ("/vision/analyze", "POST"),
        ("/agents/agents", "GET"),  # Likely should be GET, not POST
        ("/research/sites", "GET"),
    ]
    
    for endpoint, expected_method in critical_endpoints:
        if endpoint in results and expected_method in results[endpoint]:
            result = results[endpoint][expected_method]
            if result["status_code"] != 200:
                issues_found.append(f"{endpoint} {expected_method} - Status {result['status_code']}")
        else:
            issues_found.append(f"{endpoint} {expected_method} - Not tested")
    
    if issues_found:
        print("❌ Issues found:")
        for issue in issues_found:
            print(f"  • {issue}")
        
        print("\n🔧 RECOMMENDED FIXES:")
        print("  • /agents/agents should probably be GET instead of POST")
        print("  • Update frontend to use correct HTTP methods")
        print("  • Verify backend route definitions")
    else:
        print("✅ No critical issues found!")
    
    # Overall Assessment
    working_count = len([ep for ep in working_endpoints])
    total_count = len(endpoints)
    success_rate = (working_count / total_count) * 100 if total_count > 0 else 0
    
    print(f"\n🎯 OVERALL ASSESSMENT")
    print("=" * 60)
    print(f"Working Endpoints: {working_count}/{total_count} ({success_rate:.1f}%)")
    
    if success_rate >= 80:
        print("🎉 Backend is mostly functional!")
    elif success_rate >= 60:
        print("⚠️  Backend has some issues but is usable")
    else:
        print("🚨 Backend has significant issues")
    
    return success_rate >= 80

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 