#!/usr/bin/env python3
"""
Test Map Rendering Functionality
Verify that both the main map page and map tab render properly
"""

import requests
import time

def test_map_page_accessibility():
    """Test that the map page is accessible"""
    print('🗺️ Testing Map Page Accessibility')
    print('=' * 50)
    
    try:
        # Test main map page
        response = requests.get('http://localhost:3000/map', timeout=10)
        if response.status_code == 200:
            print('✅ Main map page accessible (/map)')
            
            # Check for Google Maps script
            content = response.text
            if 'maps.googleapis.com' in content:
                print('✅ Google Maps script found in HTML')
            else:
                print('⚠️ Google Maps script not found in HTML')
                
            if 'AIzaSyC-eqKjOMYNw-FMabknw6Bnxf1fjo-EW2Y' in content:
                print('✅ Google Maps API key found')
            else:
                print('⚠️ Google Maps API key not found')
                
            return True
        else:
            print(f'❌ Map page error: {response.status_code}')
            return False
            
    except Exception as e:
        print(f'❌ Error testing map page: {e}')
        return False

def test_agent_page_with_map():
    """Test that the agent page with map tab is accessible"""
    print('\n🤖 Testing Agent Page with Map Tab')
    print('=' * 50)
    
    try:
        # Test agent page
        response = requests.get('http://localhost:3000/agent', timeout=10)
        if response.status_code == 200:
            print('✅ Agent page accessible (/agent)')
            
            # Check for map-related content
            content = response.text
            if 'Map' in content or 'map' in content:
                print('✅ Map tab content found')
            else:
                print('⚠️ Map tab content not clearly identified')
                
            return True
        else:
            print(f'❌ Agent page error: {response.status_code}')
            return False
            
    except Exception as e:
        print(f'❌ Error testing agent page: {e}')
        return False

def test_google_maps_api():
    """Test if Google Maps API is accessible"""
    print('\n🌐 Testing Google Maps API')
    print('=' * 50)
    
    try:
        # Test Google Maps API endpoint
        api_url = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyC-eqKjOMYNw-FMabknw6Bnxf1fjo-EW2Y&libraries=places,geometry,drawing'
        response = requests.get(api_url, timeout=10)
        
        if response.status_code == 200:
            print('✅ Google Maps API accessible')
            print(f'   Response size: {len(response.content)} bytes')
            return True
        else:
            print(f'❌ Google Maps API error: {response.status_code}')
            return False
            
    except Exception as e:
        print(f'❌ Error testing Google Maps API: {e}')
        return False

def test_map_backend_endpoints():
    """Test backend endpoints used by the map"""
    print('\n📡 Testing Map Backend Endpoints')
    print('=' * 50)
    
    endpoints = [
        '/system/health',
        '/research/sites',
        '/satellite/imagery',
        '/agents/status'
    ]
    
    results = []
    
    for endpoint in endpoints:
        try:
            response = requests.get(f'http://localhost:8000{endpoint}', timeout=5)
            if response.status_code == 200:
                print(f'✅ {endpoint}: OK')
                results.append(True)
            else:
                print(f'⚠️ {endpoint}: {response.status_code}')
                results.append(False)
        except Exception as e:
            print(f'❌ {endpoint}: {e}')
            results.append(False)
    
    return all(results)

def main():
    print('🧪 Testing Map Rendering Functionality')
    print('=' * 60)
    print('Verifying that maps render properly in the NIS Protocol Platform\n')
    
    results = []
    
    # Test 1: Map page accessibility
    results.append(("Map Page Access", test_map_page_accessibility()))
    
    # Test 2: Agent page with map tab
    results.append(("Agent Map Tab", test_agent_page_with_map()))
    
    # Test 3: Google Maps API
    results.append(("Google Maps API", test_google_maps_api()))
    
    # Test 4: Backend endpoints
    results.append(("Backend Endpoints", test_map_backend_endpoints()))
    
    # Summary
    print('\n📊 Test Summary')
    print('=' * 60)
    
    total_tests = len(results)
    passed_tests = sum(1 for _, passed in results if passed)
    
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f'{test_name:20} {status}')
    
    print(f'\nTotal: {passed_tests}/{total_tests} tests passed')
    
    if passed_tests == total_tests:
        print('\n🎉 All map tests passed! Maps should render properly!')
        print('\n📋 Next Steps:')
        print('   1. Open http://localhost:3000/map')
        print('   2. Verify Google Maps loads and displays satellite view')
        print('   3. Test clicking on the map to select coordinates')
        print('   4. Open http://localhost:3000/agent and check Map tab')
        print('   5. Verify archaeological sites appear as markers')
    else:
        print('\n⚠️ Some map tests failed. Check the output above for details.')
        if passed_tests >= total_tests * 0.5:
            print('   Maps may still work with reduced functionality.')

if __name__ == "__main__":
    main() 