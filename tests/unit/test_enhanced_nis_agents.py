#!/usr/bin/env python3
"""
Enhanced NIS Protocol Agents Test
Tests the integrated GPT-4o web search and deep research capabilities
"""

import requests
import json
import time
import os
from datetime import datetime

def test_system_status():
    """Test system status and agent availability"""
    print("🔧 Testing Enhanced NIS Protocol System Status...")
    
    try:
        response = requests.get('http://localhost:8002/system/status')
        if response.status_code == 200:
            status = response.json()
            print(f"✅ System: {status['system']} v{status['version']}")
            print(f"   Status: {status['status']}")
            
            # Check NIS Protocol Agents
            agents = status['nis_protocol_agents']
            print(f"\n🤖 NIS Protocol Agents:")
            for agent_name, agent_info in agents.items():
                status_icon = "✅" if agent_info['enabled'] else "⚠️"
                print(f"   {status_icon} {agent_name}: {agent_info['status']}")
            
            # Check OpenAI Integration
            openai_info = status['openai_integration']
            print(f"\n🧠 OpenAI GPT-4o Integration:")
            print(f"   Client Available: {'✅' if openai_info['client_available'] else '❌'}")
            print(f"   API Key Configured: {'✅' if openai_info['api_key_configured'] else '❌'}")
            print(f"   Model: {openai_info['model']}")
            print(f"   Capabilities: {', '.join(openai_info['capabilities'])}")
            
            return True
        else:
            print(f"❌ System status check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ System connection error: {e}")
        return False

def test_enhanced_discovery():
    """Test enhanced discovery with web search"""
    print("\n🌐 Testing Enhanced Discovery with Web Search...")
    
    try:
        discovery_request = {
            "coordinates": {"lat": 19.4326, "lng": -99.1332},
            "radius_km": 50,
            "period": "all",
            "sources": ["famsi", "world_digital_library", "inah"]
        }
        
        response = requests.post(
            'http://localhost:8002/codex/discover/enhanced',
            json=discovery_request
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Enhanced discovery successful")
            print(f"   Codices found: {data['total_found']}")
            print(f"   Web enhanced: {data.get('web_enhanced', False)}")
            
            if 'web_enhancement' in data:
                web_info = data['web_enhancement']
                print(f"   Web search enabled: {web_info.get('search_enabled', False)}")
                print(f"   Data source: {web_info.get('data_source', 'unknown')}")
            
            return True
        else:
            print(f"❌ Enhanced discovery failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Enhanced discovery error: {e}")
        return False

def test_enhanced_analysis():
    """Test enhanced analysis with all NIS agents"""
    print("\n🔍 Testing Enhanced Analysis with NIS Protocol Agents...")
    
    try:
        analysis_request = {
            "codex_id": "famsi_borgia",
            "image_url": "test_url",
            "enable_web_search": True,
            "enable_deep_research": True,
            "include_comparative_analysis": True,
            "research_depth": "high"
        }
        
        response = requests.post(
            'http://localhost:8002/codex/analyze/enhanced',
            json=analysis_request
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Enhanced analysis successful")
            print(f"   Codex: {data.get('title', 'Unknown')}")
            print(f"   Analysis type: {data.get('analysis_type', 'Unknown')}")
            
            # Check NIS Protocol Status
            if 'nis_protocol_status' in data:
                nis_status = data['nis_protocol_status']
                print(f"   Web Search Agent: {'✅' if nis_status.get('web_search_agent') else '⚠️'}")
                print(f"   Deep Research Agent: {'✅' if nis_status.get('deep_research_agent') else '⚠️'}")
                print(f"   Comparative Agent: {'✅' if nis_status.get('comparative_analysis_agent') else '⚠️'}")
                print(f"   Integration Level: {nis_status.get('integration_level', 'unknown')}")
            
            # Check enhancements
            if 'web_enhancement' in data:
                web_info = data['web_enhancement']
                print(f"   Web Enhancement: {web_info.get('search_enabled', False)}")
            
            if 'deep_research' in data:
                research_info = data['deep_research']
                print(f"   Deep Research: {research_info.get('research_enabled', False)}")
            
            if 'comparative_analysis' in data:
                comp_info = data['comparative_analysis']
                print(f"   Comparative Analysis: {comp_info.get('analysis_enabled', False)}")
            
            return True
        else:
            print(f"❌ Enhanced analysis failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Enhanced analysis error: {e}")
        return False

def test_deep_research():
    """Test deep research endpoint"""
    print("\n🧠 Testing Deep Research Endpoint...")
    
    try:
        response = requests.get(
            'http://localhost:8002/codex/deep-research/famsi_borgia?research_focus=comprehensive'
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Deep research successful")
            print(f"   Codex: {data.get('codex_id', 'Unknown')}")
            print(f"   Research type: {data.get('research_type', 'Unknown')}")
            print(f"   Methodology: {data.get('methodology', 'Unknown')}")
            print(f"   Confidence: {data.get('confidence', 0)}")
            
            if 'research_results' in data:
                research_results = data['research_results']
                if 'deep_research_results' in research_results:
                    results = research_results['deep_research_results']
                    print(f"   Research areas covered: {len(results)}")
                    for result in results[:3]:  # Show first 3
                        print(f"     - {result.get('focus_area', 'Unknown')}")
            
            return True
        else:
            print(f"❌ Deep research failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Deep research error: {e}")
        return False

def show_integration_guide():
    """Show how to enable full GPT-4o integration"""
    print("\n📋 GPT-4o Integration Guide:")
    print("=" * 50)
    
    api_key_set = os.getenv('OPENAI_API_KEY') is not None
    
    if not api_key_set:
        print("❌ OpenAI API Key not configured")
        print("\n🔧 To enable full GPT-4o web search and deep research:")
        print("1. Get your OpenAI API key from: https://platform.openai.com/api-keys")
        print("2. Set the environment variable:")
        print("   export OPENAI_API_KEY='your-api-key-here'")
        print("3. Or add it to your .env file:")
        print("   OPENAI_API_KEY=your-api-key-here")
        print("4. Restart the backend service:")
        print("   pkill -f real_codex_service.py && python real_codex_service.py &")
        print("\n✨ Once configured, all NIS agents will use real GPT-4o capabilities:")
        print("   - Real-time web search for recent discoveries")
        print("   - Multi-step deep research with current data")
        print("   - Comprehensive comparative analysis")
        print("   - Live archaeological news integration")
    else:
        print("✅ OpenAI API Key is configured!")
        print("🚀 Full GPT-4o integration should be active")

def main():
    """Run comprehensive NIS protocol agent tests"""
    print("🚀 Enhanced NIS Protocol Agents Test Suite")
    print("=" * 60)
    
    tests = [
        ("System Status", test_system_status),
        ("Enhanced Discovery", test_enhanced_discovery),
        ("Enhanced Analysis", test_enhanced_analysis),
        ("Deep Research", test_deep_research)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    # Show integration guide
    show_integration_guide()
    
    # Summary
    print(f"\n📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\n🎯 Overall Result: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 All tests passed! Your enhanced NIS protocol agents are working perfectly!")
    elif passed > 0:
        print("⚠️  Some tests passed. System is partially functional.")
    else:
        print("❌ All tests failed. Please check the backend service.")
    
    print(f"\n🔗 Access your enhanced system:")
    print(f"   Frontend: http://localhost:3003/codex-reader")
    print(f"   Backend API: http://localhost:8002")
    print(f"   System Status: http://localhost:8002/system/status")
    print(f"   Enhanced Features: Web Search, Deep Research, Comparative Analysis")

if __name__ == "__main__":
    main() 