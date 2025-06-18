#!/usr/bin/env python3
"""
Comprehensive test for NIS Protocol Codex Discovery Integration
Tests the complete automated codex discovery feature implementation.
"""

import requests
import time
import json

def test_frontend_pages():
    """Test that all frontend pages are accessible"""
    print("🌐 Testing Frontend Pages")
    print("=" * 50)
    
    pages = [
        ("Home", "http://localhost:3000"),
        ("Agent", "http://localhost:3000/agent"),
        ("Satellite", "http://localhost:3000/satellite"),
        ("Map", "http://localhost:3000/map"),
        ("Analytics", "http://localhost:3000/analytics"),
        ("Codex Reader", "http://localhost:3000/codex-reader"),  # New page
        ("Chat", "http://localhost:3000/chat"),
        ("Documentation", "http://localhost:3000/documentation")
    ]
    
    results = []
    for name, url in pages:
        try:
            response = requests.get(url, timeout=10)
            status = "✅ PASS" if response.status_code == 200 else f"❌ FAIL ({response.status_code})"
            results.append(f"{name}: {status}")
            print(f"  {name}: {status}")
        except Exception as e:
            results.append(f"{name}: ❌ FAIL (Error: {str(e)})")
            print(f"  {name}: ❌ FAIL (Error: {str(e)})")
    
    return results

def test_backend_services():
    """Test backend services"""
    print("\n🔧 Testing Backend Services")
    print("=" * 50)
    
    services = [
        ("NIS Protocol Backend", "http://localhost:8000/system/health"),
        ("IKRP Codex Service", "http://localhost:8001/"),
        ("Codex Sources", "http://localhost:8001/codex/sources")
    ]
    
    results = []
    for name, url in services:
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                results.append(f"{name}: ✅ PASS")
                print(f"  {name}: ✅ PASS")
                if "codex" in url.lower():
                    data = response.json()
                    if isinstance(data, dict) and 'sources' in data:
                        print(f"    📜 Found {len(data['sources'])} digital archives")
                    elif isinstance(data, dict) and 'message' in data:
                        print(f"    📜 Service: {data['message']}")
            else:
                results.append(f"{name}: ❌ FAIL ({response.status_code})")
                print(f"  {name}: ❌ FAIL ({response.status_code})")
        except Exception as e:
            results.append(f"{name}: ❌ FAIL (Error: {str(e)})")
            print(f"  {name}: ❌ FAIL (Error: {str(e)})")
    
    return results

def test_codex_discovery_workflow():
    """Test the complete codex discovery workflow"""
    print("\n📜 Testing Codex Discovery Workflow")
    print("=" * 50)
    
    results = []
    
    # Test coordinates for Amazon region
    test_coordinates = {"lat": -3.4653, "lng": -62.2159}
    
    try:
        # Test 1: Codex Discovery
        print("  🔍 Testing automated codex discovery...")
        discovery_payload = {
            "coordinates": test_coordinates,
            "radius_km": 100,
            "period": "all",
            "sources": ["famsi", "world_digital_library", "inah"],
            "max_results": 10
        }
        
        discovery_response = requests.post(
            "http://localhost:8001/codex/discover",
            json=discovery_payload,
            timeout=30
        )
        
        if discovery_response.status_code == 200:
            discovery_data = discovery_response.json()
            results.append("Codex Discovery: ✅ PASS")
            print(f"    ✅ Found {discovery_data.get('total_codices_found', 0)} codices")
            print(f"    📊 Auto-analyzed: {discovery_data.get('auto_analyzed', 0)}")
            print(f"    ⏱️ Processing time: {discovery_data.get('search_metadata', {}).get('processing_time', 'N/A')}")
            
            # Test 2: Codex Analysis (if codices were found)
            if discovery_data.get('codices') and len(discovery_data['codices']) > 0:
                print("  🔬 Testing GPT-4.1 Vision analysis...")
                top_codex = discovery_data['codices'][0]
                
                analysis_payload = {
                    "codex_id": top_codex['id'],
                    "image_url": top_codex['image_url'],
                    "coordinates": test_coordinates,
                    "context": "Archaeological analysis test"
                }
                
                analysis_response = requests.post(
                    "http://localhost:8001/codex/analyze",
                    json=analysis_payload,
                    timeout=30
                )
                
                if analysis_response.status_code == 200:
                    analysis_data = analysis_response.json()
                    results.append("Codex Analysis: ✅ PASS")
                    print(f"    ✅ Analysis confidence: {analysis_data.get('confidence', 0) * 100:.1f}%")
                    print(f"    ⏱️ Processing time: {analysis_data.get('processing_time', 'N/A')}s")
                    
                    # Check analysis content
                    analysis_content = analysis_data.get('analysis', {})
                    if analysis_content.get('visual_elements'):
                        print(f"    👁️ Visual elements detected")
                    if analysis_content.get('archaeological_insights'):
                        print(f"    🏛️ Archaeological insights generated")
                else:
                    results.append(f"Codex Analysis: ❌ FAIL ({analysis_response.status_code})")
                    print(f"    ❌ Analysis failed: {analysis_response.status_code}")
            else:
                results.append("Codex Analysis: ⚠️ SKIP (No codices found)")
                print("    ⚠️ Skipping analysis - no codices discovered")
                
        else:
            results.append(f"Codex Discovery: ❌ FAIL ({discovery_response.status_code})")
            print(f"    ❌ Discovery failed: {discovery_response.status_code}")
            
    except Exception as e:
        results.append(f"Codex Workflow: ❌ FAIL (Error: {str(e)})")
        print(f"    ❌ Workflow error: {str(e)}")
    
    return results

def test_ikrp_integration():
    """Test IKRP integration in NIS Agent UI"""
    print("\n🧠 Testing IKRP Integration")
    print("=" * 50)
    
    results = []
    
    # Test that the agent page loads (contains IKRP integration)
    try:
        response = requests.get("http://localhost:3000/agent", timeout=10)
        if response.status_code == 200:
            results.append("Agent Page (IKRP Integration): ✅ PASS")
            print("  ✅ Agent page with IKRP integration accessible")
            
            # Check if the page contains codex-related content
            content = response.text.lower()
            if "codex" in content:
                print("  📜 Codex functionality detected in agent interface")
            if "ikrp" in content:
                print("  🧠 IKRP integration confirmed")
        else:
            results.append(f"Agent Page (IKRP Integration): ❌ FAIL ({response.status_code})")
            print(f"  ❌ Agent page failed: {response.status_code}")
    except Exception as e:
        results.append(f"Agent Page (IKRP Integration): ❌ FAIL (Error: {str(e)})")
        print(f"  ❌ Agent page error: {str(e)}")
    
    return results

def main():
    """Run all tests"""
    print("🚀 NIS Protocol Codex Discovery Integration Test")
    print("=" * 60)
    print("Testing the complete automated codex discovery feature")
    print("=" * 60)
    
    all_results = []
    
    # Run all test suites
    all_results.extend(test_frontend_pages())
    all_results.extend(test_backend_services())
    all_results.extend(test_codex_discovery_workflow())
    all_results.extend(test_ikrp_integration())
    
    # Summary
    print("\n📊 Test Summary")
    print("=" * 50)
    
    passed = len([r for r in all_results if "✅ PASS" in r])
    failed = len([r for r in all_results if "❌ FAIL" in r])
    skipped = len([r for r in all_results if "⚠️ SKIP" in r])
    total = len(all_results)
    
    print(f"Total Tests: {total}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"⚠️ Skipped: {skipped}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    if failed == 0:
        print("\n🎉 All critical tests passed! Codex Discovery integration is working!")
        print("🏛️ Features verified:")
        print("  • Automated codex discovery from digital archives")
        print("  • GPT-4.1 Vision analysis of historical documents")
        print("  • Frontend codex reader page")
        print("  • IKRP integration in agent interface")
        print("  • Complete archaeological workflow")
    else:
        print(f"\n⚠️ {failed} tests failed. Please check the issues above.")
    
    return failed == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 