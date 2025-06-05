#!/usr/bin/env python3
"""
Complete Codex Reader Functionality Test
Tests the entire codex discovery and analysis workflow
"""

import requests
import json
import time
from datetime import datetime

def test_codex_reader_complete():
    """Test complete codex reader functionality"""
    
    print("🧪 Testing Complete Codex Reader Functionality")
    print("=" * 60)
    
    # Test coordinates (Mexico City area)
    test_coordinates = {
        "lat": 19.4326,
        "lon": -99.1332
    }
    
    results = {
        "backend_health": False,
        "ikrp_service": False,
        "codex_sources": False,
        "codex_search": False,
        "codex_analysis": False,
        "frontend_access": False
    }
    
    # 1. Test Backend Health
    print("\n1️⃣ Testing Backend Health...")
    try:
        response = requests.get("http://localhost:8000/system/health", timeout=10)
        if response.status_code == 200:
            health_data = response.json()
            print(f"   ✅ Backend Status: {health_data['status']}")
            results["backend_health"] = True
        else:
            print(f"   ❌ Backend health check failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Backend health check error: {e}")
    
    # 2. Test IKRP Service Status
    print("\n2️⃣ Testing IKRP Service...")
    try:
        response = requests.get("http://localhost:8000/ikrp/status", timeout=10)
        if response.status_code == 200:
            ikrp_data = response.json()
            print(f"   ✅ IKRP Status: {ikrp_data['status']}")
            results["ikrp_service"] = True
        else:
            print(f"   ❌ IKRP status check failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ IKRP status check error: {e}")
    
    # 3. Test Codex Sources
    print("\n3️⃣ Testing Codex Sources...")
    try:
        response = requests.get("http://localhost:8000/ikrp/sources", timeout=10)
        if response.status_code == 200:
            sources_data = response.json()
            sources = sources_data.get("sources", [])
            print(f"   ✅ Found {len(sources)} codex sources:")
            for source in sources:
                print(f"      - {source['name']}: {source['total_codices']} codices")
            results["codex_sources"] = True
        else:
            print(f"   ❌ Codex sources failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Codex sources error: {e}")
    
    # 4. Test Codex Search
    print("\n4️⃣ Testing Codex Search...")
    try:
        search_payload = {
            "coordinates": test_coordinates,
            "radius_km": 100,
            "sources": ["famsi", "world_digital_library", "inah"]
        }
        
        response = requests.post(
            "http://localhost:8000/ikrp/search_codices",
            json=search_payload,
            timeout=30
        )
        
        if response.status_code == 200:
            search_data = response.json()
            codices = search_data.get("codices", [])
            print(f"   ✅ Found {len(codices)} relevant codices:")
            
            for codex in codices[:3]:  # Show first 3
                print(f"      - {codex['title']}")
                print(f"        Source: {codex['source']}")
                print(f"        Relevance: {codex['relevance_score']:.2f}")
                if 'analysis' in codex:
                    print(f"        Auto-analyzed: ✅")
                print()
            
            results["codex_search"] = True
            
            # Store first codex for analysis test
            if codices:
                global test_codex
                test_codex = codices[0]
                
        else:
            print(f"   ❌ Codex search failed: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Codex search error: {e}")
    
    # 5. Test Codex Analysis
    print("\n5️⃣ Testing Codex Analysis...")
    try:
        if 'test_codex' in globals():
            analysis_payload = {
                "codex_id": test_codex["id"],
                "image_url": test_codex["image_url"],
                "coordinates": test_coordinates
            }
            
            response = requests.post(
                "http://localhost:8000/ikrp/analyze_codex",
                json=analysis_payload,
                timeout=60
            )
            
            if response.status_code == 200:
                analysis_data = response.json()
                analysis = analysis_data.get("analysis", {})
                
                print(f"   ✅ Analysis completed for: {test_codex['title']}")
                print(f"   Overall Confidence: {analysis_data.get('confidence', 0):.2f}")
                
                # Show key analysis components
                if "visual_elements" in analysis:
                    visual = analysis["visual_elements"]
                    print(f"   Visual Elements: {len(visual.get('figures', []))} figures, {len(visual.get('symbols', []))} symbols")
                
                if "archaeological_insights" in analysis:
                    insights = analysis["archaeological_insights"]
                    print(f"   Archaeological Insights: {len(insights.get('site_types', []))} site types identified")
                
                if "recommendations" in analysis:
                    print(f"   Recommendations: Available")
                
                results["codex_analysis"] = True
            else:
                print(f"   ❌ Codex analysis failed: {response.status_code}")
        else:
            print("   ⚠️ No codex available for analysis (search failed)")
    except Exception as e:
        print(f"   ❌ Codex analysis error: {e}")
    
    # 6. Test Frontend Access
    print("\n6️⃣ Testing Frontend Access...")
    try:
        response = requests.get("http://localhost:3000", timeout=10)
        if response.status_code == 200:
            print("   ✅ Frontend accessible")
            results["frontend_access"] = True
        else:
            print(f"   ❌ Frontend access failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Frontend access error: {e}")
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 CODEX READER TEST SUMMARY")
    print("=" * 60)
    
    total_tests = len(results)
    passed_tests = sum(results.values())
    success_rate = (passed_tests / total_tests) * 100
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\nOverall Success Rate: {success_rate:.1f}% ({passed_tests}/{total_tests})")
    
    if success_rate == 100:
        print("\n🎉 ALL TESTS PASSED! Codex Reader is fully functional!")
    elif success_rate >= 80:
        print("\n✅ Most tests passed. Codex Reader is mostly functional.")
    else:
        print("\n⚠️ Several tests failed. Codex Reader needs attention.")
    
    print(f"\nTest completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    return results

if __name__ == "__main__":
    test_codex_reader_complete() 