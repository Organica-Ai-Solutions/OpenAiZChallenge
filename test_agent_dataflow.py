#!/usr/bin/env python3
"""
NIS Protocol Agent Page Dataflow Test
Tests the complete discovery workflow from frontend to backend
"""

import requests
import json
import time
import sys
from datetime import datetime

# Test Configuration
BACKEND_URL = "http://localhost:8000"
TEST_COORDINATES = [
    ("-3.4653", "-62.2159"),  # Amazon Basin
    ("-12.2551", "-53.2134"),  # Kuhikugu
    ("-9.8282", "-67.9452"),   # Acre Geoglyphs
]

def test_backend_health():
    """Test backend health endpoint"""
    print("🔍 Testing Backend Health...")
    try:
        response = requests.get(f"{BACKEND_URL}/system/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Backend Health: {health_data.get('status', 'Unknown')}")
            print(f"   Services: {health_data.get('services', {})}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend health check failed: {e}")
        return False

def test_analyze_endpoint(lat, lon):
    """Test the main analyze endpoint used by the agent"""
    print(f"🎯 Testing Analysis Endpoint for {lat}, {lon}...")
    
    payload = {
        "lat": float(lat),
        "lon": float(lon),
        "data_sources": ["satellite", "lidar", "historical", "indigenous"],
        "confidence_threshold": 0.7
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/analyze",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Analysis successful:")
            print(f"   Confidence: {result.get('confidence', 0) * 100:.1f}%")
            print(f"   Pattern: {result.get('pattern_type', 'Unknown')}")
            print(f"   Finding ID: {result.get('finding_id', 'N/A')}")
            return result
        else:
            print(f"❌ Analysis failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return None
    except Exception as e:
        print(f"❌ Analysis request failed: {e}")
        return None

def test_vision_endpoint(lat, lon):
    """Test the vision analysis endpoint"""
    print(f"👁️ Testing Vision Analysis for {lat}, {lon}...")
    
    payload = {
        "coordinates": f"{lat}, {lon}",
        "models": ["gpt4o_vision", "archaeological_analysis"],
        "confidence_threshold": 0.4
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/vision/analyze",
            json=payload,
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Vision analysis successful:")
            print(f"   Models: {result.get('metadata', {}).get('models_used', [])}")
            print(f"   Processing time: {result.get('metadata', {}).get('processing_time', 'Unknown')}")
            return result
        else:
            print(f"❌ Vision analysis failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Vision analysis request failed: {e}")
        return None

def test_research_sites():
    """Test the research sites endpoint"""
    print("🏛️ Testing Research Sites Endpoint...")
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/research/sites?max_sites=10&min_confidence=0.5",
            timeout=10
        )
        
        if response.status_code == 200:
            sites = response.json()
            print(f"✅ Research sites loaded: {len(sites)} sites")
            for i, site in enumerate(sites[:3]):  # Show first 3
                print(f"   {i+1}. {site.get('name', 'Unknown')} - {site.get('coordinates', 'No coords')}")
            return sites
        else:
            print(f"❌ Research sites failed: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Research sites request failed: {e}")
        return []

def test_agents_endpoint():
    """Test the agents endpoint"""
    print("🤖 Testing Agents Endpoint...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/agents/agents", timeout=5)
        
        if response.status_code == 200:
            agents = response.json()
            print(f"✅ Agents loaded: {len(agents)} agents")
            for agent in agents[:3]:  # Show first 3
                print(f"   - {agent.get('name', 'Unknown')}: {agent.get('status', 'Unknown')}")
            return agents
        else:
            print(f"❌ Agents endpoint failed: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Agents request failed: {e}")
        return []

def test_statistics():
    """Test the statistics endpoint"""
    print("📊 Testing Statistics Endpoint...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/statistics", timeout=5)
        
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Statistics loaded:")
            print(f"   Total sites: {stats.get('total_sites_discovered', 'Unknown')}")
            print(f"   Success rate: {stats.get('analysis_metrics', {}).get('success_rate', 'Unknown')}%")
            return stats
        else:
            print(f"❌ Statistics failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Statistics request failed: {e}")
        return None

def test_full_discovery_workflow():
    """Test the complete discovery workflow"""
    print("\n🔄 Testing Complete Discovery Workflow...")
    
    results = {}
    
    # Test backend health
    results['health'] = test_backend_health()
    time.sleep(1)
    
    # Test core endpoints
    results['sites'] = test_research_sites()
    time.sleep(1)
    
    results['agents'] = test_agents_endpoint()
    time.sleep(1)
    
    results['statistics'] = test_statistics()
    time.sleep(1)
    
    # Test analysis for different coordinates
    results['analyses'] = []
    for lat, lon in TEST_COORDINATES:
        print(f"\n📍 Testing coordinate pair: {lat}, {lon}")
        
        # Test main analysis
        analysis = test_analyze_endpoint(lat, lon)
        if analysis:
            results['analyses'].append(analysis)
        
        time.sleep(1)
        
        # Test vision analysis
        vision = test_vision_endpoint(lat, lon)
        if vision:
            results['analyses'][-1]['vision_result'] = vision if analysis else vision
        
        time.sleep(2)  # Longer pause between coordinate tests
    
    return results

def generate_test_report(results):
    """Generate a comprehensive test report"""
    print("\n" + "="*60)
    print("🎯 NIS PROTOCOL AGENT DATAFLOW TEST REPORT")
    print("="*60)
    
    print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Backend URL: {BACKEND_URL}")
    
    print("\n📊 ENDPOINT TEST RESULTS:")
    print(f"   ✅ Backend Health: {'PASS' if results.get('health') else 'FAIL'}")
    print(f"   ✅ Research Sites: {'PASS' if results.get('sites') else 'FAIL'}")
    print(f"   ✅ Agents: {'PASS' if results.get('agents') else 'FAIL'}")
    print(f"   ✅ Statistics: {'PASS' if results.get('statistics') else 'FAIL'}")
    
    print(f"\n🎯 ANALYSIS TEST RESULTS:")
    successful_analyses = len([a for a in results.get('analyses', []) if a])
    total_tests = len(TEST_COORDINATES)
    print(f"   Successful analyses: {successful_analyses}/{total_tests}")
    
    if results.get('analyses'):
        print("\n   📍 Coordinate Analysis Details:")
        for i, analysis in enumerate(results['analyses']):
            if analysis:
                coord_pair = TEST_COORDINATES[i]
                confidence = analysis.get('confidence', 0) * 100
                pattern = analysis.get('pattern_type', 'Unknown')
                print(f"      {coord_pair[0]}, {coord_pair[1]}: {confidence:.1f}% - {pattern}")
    
    print(f"\n🏁 OVERALL STATUS:")
    if results.get('health') and successful_analyses > 0:
        print("   ✅ AGENT DATAFLOW: OPERATIONAL")
        print("   🎉 Discovery functionality is working!")
    elif results.get('health'):
        print("   ⚠️  AGENT DATAFLOW: PARTIAL")
        print("   🔧 Backend online but some endpoints need attention")
    else:
        print("   ❌ AGENT DATAFLOW: OFFLINE")
        print("   🚨 Backend not responding - demo mode only")
    
    print("\n💡 RECOMMENDATIONS:")
    if not results.get('health'):
        print("   1. Start the backend server with: python simple_backend.py")
        print("   2. Verify port 8000 is available")
    elif successful_analyses < total_tests:
        print("   1. Check backend logs for analysis endpoint errors")
        print("   2. Verify OpenAI API keys are configured")
    else:
        print("   1. All systems operational! 🚀")
        print("   2. Frontend agent page should work perfectly")
    
    print("="*60)

def main():
    """Main test execution"""
    print("🚀 Starting NIS Protocol Agent Dataflow Test...")
    print(f"🎯 Testing backend at: {BACKEND_URL}")
    
    try:
        results = test_full_discovery_workflow()
        generate_test_report(results)
        
        # Export detailed results
        with open('agent_dataflow_test_results.json', 'w') as f:
            json.dump(results, f, indent=2, default=str)
        print(f"\n📄 Detailed results saved to: agent_dataflow_test_results.json")
        
        return 0 if results.get('health') else 1
        
    except KeyboardInterrupt:
        print("\n⚠️ Test interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Test failed with error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 