#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

def test_endpoint(url, method='GET', data=None, headers=None):
    """Test a single endpoint and return results"""
    try:
        if headers is None:
            headers = {'accept': 'application/json'}
        
        if method == 'GET':
            response = requests.get(url, headers=headers, timeout=10)
        elif method == 'POST':
            response = requests.post(url, json=data, headers=headers, timeout=10)
        
        return {
            'url': url,
            'status_code': response.status_code,
            'success': response.status_code < 400,
            'response': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text[:200],
            'response_time': response.elapsed.total_seconds()
        }
    except requests.exceptions.RequestException as e:
        return {
            'url': url,
            'status_code': None,
            'success': False,
            'error': str(e),
            'response_time': None
        }

def main():
    print(f"🧪 Backend Endpoint Testing - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    base_url = "http://localhost:8000"
    
    # Test endpoints
    endpoints_to_test = [
        # System endpoints
        {'url': f'{base_url}/system/health', 'method': 'GET'},
        {'url': f'{base_url}/system/status', 'method': 'GET'},
        
        # Research endpoints
        {'url': f'{base_url}/research/sites', 'method': 'GET'},
        {'url': f'{base_url}/research/discoveries', 'method': 'GET'},
        
        # Codex endpoints
        {'url': f'{base_url}/codex/analyze', 'method': 'GET'},
        {'url': f'{base_url}/codex/read', 'method': 'GET'},
        
        # Analysis endpoints
        {'url': f'{base_url}/analyze/coordinate', 'method': 'POST', 'data': {'coordinates': '-3.4653, -62.2159'}},
        {'url': f'{base_url}/analyze/region', 'method': 'GET'},
        
        # IKRP endpoints
        {'url': f'{base_url}/ikrp/status', 'method': 'GET'},
        {'url': f'{base_url}/ikrp/discoveries', 'method': 'GET'},
    ]
    
    results = []
    
    for endpoint in endpoints_to_test:
        print(f"Testing {endpoint['method']} {endpoint['url']}")
        result = test_endpoint(
            endpoint['url'], 
            endpoint['method'], 
            endpoint.get('data'),
            {'accept': 'application/json', 'Content-Type': 'application/json'}
        )
        results.append(result)
        
        if result['success']:
            print(f"  ✅ Success ({result['status_code']}) - {result['response_time']:.3f}s")
            if isinstance(result['response'], dict) and 'status' in result['response']:
                print(f"     Status: {result['response']['status']}")
        else:
            print(f"  ❌ Failed ({result.get('status_code', 'N/A')}) - {result.get('error', 'Unknown error')}")
        print()
    
    # Summary
    successful = sum(1 for r in results if r['success'])
    total = len(results)
    
    print("=" * 60)
    print(f"📊 Test Summary: {successful}/{total} endpoints working")
    print(f"✅ Success Rate: {(successful/total)*100:.1f}%")
    
    # Show failing endpoints
    failing = [r for r in results if not r['success']]
    if failing:
        print("\n❌ Failing Endpoints:")
        for fail in failing:
            error_msg = fail.get('error', f"Status {fail.get('status_code')}")
            print(f"  - {fail['url']}: {error_msg}")
    
    # Show codex-specific results
    codex_results = [r for r in results if '/codex/' in r['url']]
    if codex_results:
        print(f"\n📚 Codex Reader Endpoints:")
        for codex in codex_results:
            status = "✅ Working" if codex['success'] else "❌ Failed"
            print(f"  {codex['url']}: {status}")

if __name__ == "__main__":
    main() 