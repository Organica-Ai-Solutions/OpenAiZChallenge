#!/usr/bin/env python3
"""
GPT-4o Enhanced Codex Analysis System Test
Tests the new web search and deep research capabilities
"""

import requests
import json
import time
from datetime import datetime

def test_backend_health():
    """Test if the enhanced backend is running"""
    print("🔧 Testing Enhanced Backend Health...")
    
    try:
        response = requests.get('http://localhost:8002/codex/sources')
        if response.status_code == 200:
            sources = response.json()
            print(f"✅ Backend online: {len(sources['sources'])} sources available")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend connection error: {e}")
        return False

def test_enhanced_analysis():
    """Test enhanced analysis with web search capabilities"""
    print("\n🔍 Testing Enhanced Analysis with Web Search...")
    
    try:
        # Test enhanced analysis endpoint
        payload = {
            "codex_id": "famsi_borgia",
            "image_url": "http://localhost:3000/placeholder-codex.svg",
            "analysis_type": "comprehensive",
            "enable_web_search": True,
            "enable_deep_research": False,
            "research_depth": "medium",
            "include_recent_discoveries": True,
            "include_comparative_analysis": True
        }
        
        response = requests.post(
            'http://localhost:8002/codex/analyze/enhanced',
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            analysis = response.json()
            print(f"✅ Enhanced analysis successful")
            print(f"   - Codex: {analysis.get('title', 'Unknown')}")
            print(f"   - Analysis Type: {analysis.get('analysis_type', 'Unknown')}")
            print(f"   - Confidence: {analysis.get('confidence', 0) * 100:.1f}%")
            print(f"   - Web Search Enabled: {analysis.get('web_search_enabled', False)}")
            print(f"   - Research Depth: {analysis.get('research_depth', 'Unknown')}")
            
            # Check for enhanced features
            enhanced_analysis = analysis.get('enhanced_analysis', {})
            if enhanced_analysis:
                print(f"   - Web Sources Consulted: {enhanced_analysis.get('web_sources_consulted', 0)}")
                print(f"   - Analysis Sections: {len(enhanced_analysis.get('analysis_sections', {}))}")
            
            # Check for enhanced recommendations
            enhanced_recs = analysis.get('enhanced_recommendations', {})
            if enhanced_recs:
                priority_areas = enhanced_recs.get('priority_research_areas', [])
                print(f"   - Priority Research Areas: {len(priority_areas)}")
                digital_tools = enhanced_recs.get('digital_tools', [])
                print(f"   - Digital Tools Recommended: {len(digital_tools)}")
                funding_ops = enhanced_recs.get('funding_opportunities', [])
                print(f"   - Funding Opportunities: {len(funding_ops)}")
            
            return True
        else:
            print(f"❌ Enhanced analysis failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
            return False
            
    except Exception as e:
        print(f"❌ Enhanced analysis error: {e}")
        return False

def test_deep_research():
    """Test deep research capabilities"""
    print("\n🧠 Testing Deep Research with GPT-4o...")
    
    try:
        # Test deep research endpoint
        response = requests.post(
            'http://localhost:8002/codex/deep-research',
            params={
                'codex_id': 'famsi_borgia',
                'research_focus': 'comprehensive'
            },
            timeout=60  # Deep research takes longer
        )
        
        if response.status_code == 200:
            research = response.json()
            print(f"✅ Deep research successful")
            print(f"   - Codex ID: {research.get('codex_id', 'Unknown')}")
            print(f"   - Research Focus: {research.get('research_focus', 'Unknown')}")
            print(f"   - Research Type: {research.get('research_type', 'Unknown')}")
            print(f"   - Methodology: {research.get('methodology', 'Unknown')}")
            print(f"   - Confidence: {research.get('confidence', 0) * 100:.1f}%")
            print(f"   - Sources: {research.get('sources', 'Unknown')}")
            
            # Check report length
            report = research.get('report', '')
            if report:
                print(f"   - Report Length: {len(report)} characters")
                print(f"   - Report Preview: {report[:150]}...")
            
            return True
        else:
            print(f"❌ Deep research failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
            return False
            
    except Exception as e:
        print(f"❌ Deep research error: {e}")
        return False

def test_enhanced_discovery():
    """Test enhanced discovery with web search"""
    print("\n🌐 Testing Enhanced Discovery with Web Search...")
    
    try:
        # Test enhanced discovery endpoint
        payload = {
            "coordinates": {"lat": 19.4326, "lng": -99.1332},
            "radius_km": 50,
            "period": "all",
            "sources": ["famsi", "world_digital_library", "inah"],
            "include_images": True
        }
        
        response = requests.post(
            'http://localhost:8002/codex/discover/enhanced',
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            discovery = response.json()
            print(f"✅ Enhanced discovery successful")
            print(f"   - Codices Found: {len(discovery.get('codices', []))}")
            print(f"   - Web Enhanced: {discovery.get('web_enhanced', False)}")
            print(f"   - Last Web Search: {discovery.get('last_web_search', 'Unknown')}")
            
            # Check for recent discoveries
            recent_discoveries = discovery.get('recent_discoveries', '')
            if recent_discoveries:
                print(f"   - Recent Discoveries Info: {len(recent_discoveries)} characters")
                print(f"   - Preview: {recent_discoveries[:100]}...")
            
            # List found codices
            codices = discovery.get('codices', [])
            for i, codex in enumerate(codices[:3]):  # Show first 3
                print(f"   - Codex {i+1}: {codex.get('title', 'Unknown')} ({codex.get('source', 'Unknown')})")
            
            return True
        else:
            print(f"❌ Enhanced discovery failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
            return False
            
    except Exception as e:
        print(f"❌ Enhanced discovery error: {e}")
        return False

def test_frontend_integration():
    """Test frontend integration with enhanced features"""
    print("\n🖥️  Testing Frontend Integration...")
    
    try:
        response = requests.get('http://localhost:3000/codex-reader', timeout=10)
        if response.status_code == 200:
            html_content = response.text
            
            # Check for enhanced features in HTML
            enhanced_features = [
                'GPT-4o Enhanced Analysis',
                'Real-time Web Search',
                'Deep Research Mode',
                'Enhanced Search',
                'web_search_enabled',
                'deep_research_enabled'
            ]
            
            found_features = []
            for feature in enhanced_features:
                if feature in html_content:
                    found_features.append(feature)
            
            print(f"✅ Frontend accessible")
            print(f"   - Enhanced Features Found: {len(found_features)}/{len(enhanced_features)}")
            for feature in found_features:
                print(f"     ✓ {feature}")
            
            missing_features = set(enhanced_features) - set(found_features)
            if missing_features:
                print(f"   - Missing Features:")
                for feature in missing_features:
                    print(f"     ✗ {feature}")
            
            return len(found_features) >= len(enhanced_features) // 2
        else:
            print(f"❌ Frontend not accessible: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Frontend test error: {e}")
        return False

def test_performance_comparison():
    """Compare performance between regular and enhanced analysis"""
    print("\n⚡ Testing Performance Comparison...")
    
    try:
        # Test regular analysis
        start_time = time.time()
        regular_response = requests.post(
            'http://localhost:8002/codex/analyze',
            json={
                "codex_id": "famsi_borgia",
                "image_url": "http://localhost:3000/placeholder-codex.svg",
                "analysis_type": "comprehensive"
            },
            timeout=30
        )
        regular_time = time.time() - start_time
        
        # Test enhanced analysis
        start_time = time.time()
        enhanced_response = requests.post(
            'http://localhost:8002/codex/analyze/enhanced',
            json={
                "codex_id": "famsi_borgia",
                "image_url": "http://localhost:3000/placeholder-codex.svg",
                "analysis_type": "comprehensive",
                "enable_web_search": True,
                "enable_deep_research": False,
                "research_depth": "medium"
            },
            timeout=30
        )
        enhanced_time = time.time() - start_time
        
        print(f"✅ Performance comparison completed")
        print(f"   - Regular Analysis: {regular_time:.2f}s")
        print(f"   - Enhanced Analysis: {enhanced_time:.2f}s")
        print(f"   - Time Difference: +{enhanced_time - regular_time:.2f}s ({((enhanced_time/regular_time - 1) * 100):.1f}% slower)")
        
        # Compare response quality
        if regular_response.status_code == 200 and enhanced_response.status_code == 200:
            regular_data = regular_response.json()
            enhanced_data = enhanced_response.json()
            
            regular_confidence = regular_data.get('confidence', 0)
            enhanced_confidence = enhanced_data.get('confidence', 0)
            
            print(f"   - Regular Confidence: {regular_confidence * 100:.1f}%")
            print(f"   - Enhanced Confidence: {enhanced_confidence * 100:.1f}%")
            print(f"   - Confidence Improvement: +{(enhanced_confidence - regular_confidence) * 100:.1f}%")
        
        return True
        
    except Exception as e:
        print(f"❌ Performance comparison error: {e}")
        return False

def main():
    """Run comprehensive GPT-4o enhanced system test"""
    print("🚀 GPT-4o Enhanced Codex Analysis System Test")
    print("=" * 60)
    
    test_results = []
    
    # Run all tests
    tests = [
        ("Backend Health", test_backend_health),
        ("Enhanced Analysis", test_enhanced_analysis),
        ("Deep Research", test_deep_research),
        ("Enhanced Discovery", test_enhanced_discovery),
        ("Frontend Integration", test_frontend_integration),
        ("Performance Comparison", test_performance_comparison)
    ]
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            test_results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            test_results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in test_results if result)
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\n🎯 Overall Result: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print("🎉 All tests passed! GPT-4o enhanced system is fully functional!")
    elif passed >= total * 0.8:
        print("✅ Most tests passed! System is largely functional with minor issues.")
    elif passed >= total * 0.5:
        print("⚠️  Some tests failed. System has partial functionality.")
    else:
        print("❌ Many tests failed. System needs attention.")
    
    print("\n🔗 Access the enhanced system:")
    print("   Frontend: http://localhost:3000/codex-reader")
    print("   Backend API: http://localhost:8002")
    print("   Enhanced Features: Web Search, Deep Research, Real-time Data")

if __name__ == "__main__":
    main() 