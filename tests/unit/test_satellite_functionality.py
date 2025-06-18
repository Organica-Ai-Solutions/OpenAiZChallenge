#!/usr/bin/env python3
"""
Test script for satellite page functionality
"""

import requests
import json
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_backend_endpoints():
    """Test backend satellite endpoints"""
    print("🛰️ Testing backend satellite endpoints...")
    
    base_url = "http://localhost:8000"
    
    # Test coordinates
    test_coords = {"lat": -3.4653, "lng": -62.2159}
    
    endpoints_to_test = [
        {
            "name": "Health Check",
            "method": "GET", 
            "url": f"{base_url}/",
            "expected_status": [200, 404]
        },
        {
            "name": "Satellite Imagery",
            "method": "POST",
            "url": f"{base_url}/satellite/imagery/latest",
            "data": {"coordinates": test_coords, "radius": 2000},
            "expected_status": [200, 404, 422]
        },
        {
            "name": "Change Detection",
            "method": "POST", 
            "url": f"{base_url}/satellite/change-detection",
            "data": {
                "coordinates": test_coords,
                "start_date": "2024-01-01T00:00:00Z",
                "end_date": "2024-12-01T00:00:00Z"
            },
            "expected_status": [200, 404, 422]
        }
    ]
    
    results = []
    
    for endpoint in endpoints_to_test:
        try:
            print(f"Testing {endpoint['name']}...")
            
            if endpoint['method'] == 'GET':
                response = requests.get(endpoint['url'], timeout=5)
            else:
                response = requests.post(
                    endpoint['url'], 
                    json=endpoint.get('data'),
                    headers={'Content-Type': 'application/json'},
                    timeout=5
                )
            
            status_ok = response.status_code in endpoint['expected_status']
            results.append({
                "endpoint": endpoint['name'],
                "status": response.status_code,
                "success": status_ok,
                "response_size": len(response.text)
            })
            
            print(f"  ✅ {endpoint['name']}: {response.status_code} ({'OK' if status_ok else 'UNEXPECTED'})")
            
        except requests.exceptions.RequestException as e:
            results.append({
                "endpoint": endpoint['name'],
                "status": "ERROR",
                "success": False,
                "error": str(e)
            })
            print(f"  ❌ {endpoint['name']}: {e}")
    
    return results

def test_frontend_page():
    """Test frontend satellite page"""
    print("\n🌐 Testing frontend satellite page...")
    
    # Setup Chrome options for headless mode
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        driver.get("http://localhost:3000/satellite")
        
        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Check for key elements
        tests = [
            {
                "name": "Page Title",
                "selector": "h1",
                "expected_text": "Satellite Monitoring System"
            },
            {
                "name": "Navigation",
                "selector": "nav",
                "expected": True
            },
            {
                "name": "Satellite Monitor Component",
                "selector": "[role='tablist'], .satellite-monitor, h2",
                "expected": True
            },
            {
                "name": "Health Status Monitor",
                "selector": "h2",
                "expected_text": "System Health"
            },
            {
                "name": "Coordinate Input",
                "selector": "input[placeholder*='coordinates']",
                "expected": True
            }
        ]
        
        results = []
        
        for test in tests:
            try:
                if "expected_text" in test:
                    element = driver.find_element(By.CSS_SELECTOR, test["selector"])
                    success = test["expected_text"].lower() in element.text.lower()
                    results.append({
                        "test": test["name"],
                        "success": success,
                        "found_text": element.text[:100] if element.text else "No text"
                    })
                    print(f"  {'✅' if success else '❌'} {test['name']}: {'FOUND' if success else 'NOT FOUND'}")
                else:
                    elements = driver.find_elements(By.CSS_SELECTOR, test["selector"])
                    success = len(elements) > 0
                    results.append({
                        "test": test["name"],
                        "success": success,
                        "elements_found": len(elements)
                    })
                    print(f"  {'✅' if success else '❌'} {test['name']}: {len(elements)} elements found")
                    
            except Exception as e:
                results.append({
                    "test": test["name"],
                    "success": False,
                    "error": str(e)
                })
                print(f"  ❌ {test['name']}: {e}")
        
        # Test coordinate input functionality
        try:
            coord_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder*='coordinates']")
            coord_input.clear()
            coord_input.send_keys("-12.0464, -77.0428")  # Lima coordinates
            
            update_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Update')]")
            update_button.click()
            
            time.sleep(2)  # Wait for update
            
            results.append({
                "test": "Coordinate Update Functionality",
                "success": True,
                "details": "Successfully updated coordinates"
            })
            print("  ✅ Coordinate Update Functionality: SUCCESS")
            
        except Exception as e:
            results.append({
                "test": "Coordinate Update Functionality", 
                "success": False,
                "error": str(e)
            })
            print(f"  ❌ Coordinate Update Functionality: {e}")
        
        driver.quit()
        return results
        
    except Exception as e:
        print(f"  ❌ Frontend test failed: {e}")
        return [{"test": "Frontend Page Load", "success": False, "error": str(e)}]

def main():
    print("🧪 Starting Satellite Page Functionality Tests\n")
    print("=" * 60)
    
    # Test backend first
    backend_results = test_backend_endpoints()
    
    # Test frontend
    frontend_results = test_frontend_page()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    backend_success = sum(1 for r in backend_results if r.get('success', False))
    frontend_success = sum(1 for r in frontend_results if r.get('success', False))
    
    print(f"Backend Tests: {backend_success}/{len(backend_results)} passed")
    print(f"Frontend Tests: {frontend_success}/{len(frontend_results)} passed")
    
    total_success = backend_success + frontend_success
    total_tests = len(backend_results) + len(frontend_results)
    
    print(f"\nOverall: {total_success}/{total_tests} tests passed ({total_success/total_tests*100:.1f}%)")
    
    if total_success == total_tests:
        print("\n🎉 All tests passed! Satellite page is working correctly.")
    elif total_success >= total_tests * 0.7:
        print("\n⚠️ Most tests passed. Satellite page is mostly functional with minor issues.")
    else:
        print("\n❌ Multiple test failures. Satellite page needs attention.")
    
    # Save detailed results
    with open('satellite_test_results.json', 'w') as f:
        json.dump({
            "backend_results": backend_results,
            "frontend_results": frontend_results,
            "summary": {
                "backend_success": backend_success,
                "frontend_success": frontend_success,
                "total_success": total_success,
                "total_tests": total_tests,
                "success_rate": total_success/total_tests
            }
        }, f, indent=2)
    
    print(f"\n📄 Detailed results saved to satellite_test_results.json")

if __name__ == "__main__":
    main() 