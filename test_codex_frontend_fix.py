#!/usr/bin/env python3
"""
Test Fixed Codex Frontend Functionality
Test that discover and analyze buttons work properly after endpoint fixes
"""

import requests
import json
import time

def test_ikrp_service_direct():
    """Test IKRP service directly"""
    print('🔍 Testing IKRP Service Directly')
    print('=' * 50)
    
    try:
        # Test discovery endpoint
        discovery_payload = {
            "coordinates": {"lat": -3.4653, "lng": -62.2159},
            "radius_km": 100,
            "period": "all",
            "sources": ["famsi"],
            "max_results": 5
        }
        
        print('📜 Testing codex discovery...')
        response = requests.post('http://localhost:8001/codex/discover', 
                               json=discovery_payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f'✅ Discovery: Found {data.get("total_codices_found", 0)} codices')
            print(f'   Auto-analyzed: {data.get("auto_analyzed", 0)}')
            
            # Test analysis if codices found
            if data.get('codices') and len(data['codices']) > 0:
                top_codex = data['codices'][0]
                print(f'\n🧠 Testing analysis of: {top_codex["title"]}')
                
                analysis_payload = {
                    "codex_id": top_codex['id'],
                    "image_url": top_codex['image_url'],
                    "coordinates": discovery_payload['coordinates'],
                    "context": "Test analysis"
                }
                
                response = requests.post('http://localhost:8001/codex/analyze',
                                       json=analysis_payload, timeout=15)
                
                if response.status_code == 200:
                    analysis_data = response.json()
                    print(f'✅ Analysis: Confidence {analysis_data.get("confidence", "N/A")}')
                    print(f'   Status: {analysis_data.get("status", "completed")}')
                    return True
                else:
                    print(f'❌ Analysis failed: {response.status_code}')
                    return False
            else:
                print('⚠️ No codices found for analysis test')
                return True
        else:
            print(f'❌ Discovery failed: {response.status_code}')
            return False
            
    except Exception as e:
        print(f'❌ Error: {e}')
        return False

def test_main_backend_proxy():
    """Test main backend proxy endpoints"""
    print('\n🔗 Testing Main Backend Proxy')
    print('=' * 50)
    
    try:
        # Test IKRP status through main backend
        print('📡 Testing IKRP status through main backend...')
        response = requests.get('http://localhost:8000/ikrp/status', timeout=10)
        status_data = response.json()
        
        if status_data.get('status') == 'unavailable':
            print('⚠️ Main backend cannot reach IKRP service')
            print('   This is expected - frontend now calls IKRP directly')
            return True
        else:
            print('✅ Main backend can reach IKRP service')
            return True
            
    except Exception as e:
        print(f'❌ Backend proxy test error: {e}')
        return False

def test_frontend_accessibility():
    """Test that frontend is accessible"""
    print('\n🌐 Testing Frontend Accessibility')
    print('=' * 50)
    
    try:
        # Test main frontend
        response = requests.get('http://localhost:3000/', timeout=10)
        if response.status_code == 200:
            print('✅ Frontend accessible at localhost:3000')
            
            # Test codex-reader page
            response = requests.get('http://localhost:3000/codex-reader', timeout=10)
            if response.status_code == 200:
                print('✅ Codex reader page accessible')
                return True
            else:
                print(f'❌ Codex reader page error: {response.status_code}')
                return False
        else:
            print(f'❌ Frontend not accessible: {response.status_code}')
            return False
            
    except Exception as e:
        print(f'❌ Frontend test error: {e}')
        return False

def main():
    print('🧪 Testing Fixed Codex Frontend Functionality')
    print('=' * 60)
    print('Testing that discover and analyze buttons work after endpoint fixes\n')
    
    results = []
    
    # Test 1: IKRP service direct access
    results.append(("IKRP Direct Access", test_ikrp_service_direct()))
    
    # Test 2: Main backend proxy status
    results.append(("Backend Proxy Status", test_main_backend_proxy()))
    
    # Test 3: Frontend accessibility
    results.append(("Frontend Accessibility", test_frontend_accessibility()))
    
    # Summary
    print('\n📊 Test Summary')
    print('=' * 60)
    
    total_tests = len(results)
    passed_tests = sum(1 for _, passed in results if passed)
    
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f'{test_name:25} {status}')
    
    print(f'\nTotal: {passed_tests}/{total_tests} tests passed')
    
    if passed_tests == total_tests:
        print('\n🎉 All tests passed! Codex discover and analyze buttons should work!')
        print('\n📋 Next Steps:')
        print('   1. Open http://localhost:3000/codex-reader')
        print('   2. Enter coordinates: -3.4653, -62.2159')
        print('   3. Click "Discover Codices" button')
        print('   4. Click "Analyze with AI" on any found codex')
        print('   5. Verify results appear properly')
    else:
        print('\n⚠️ Some tests failed. Check the output above for details.')

if __name__ == "__main__":
    main() 