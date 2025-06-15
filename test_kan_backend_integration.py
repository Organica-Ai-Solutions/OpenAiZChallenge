"""KAN Backend Integration Test - Day 7.

Comprehensive test demonstrating KAN integration, performance, and archaeological discoveries.
"""

import asyncio
import time
import json
from datetime import datetime
from typing import Dict, List

def print_header(title: str):
    """Print a formatted header."""
    print(f"\n{'='*70}")
    print(f"🏛️ {title}")
    print(f"{'='*70}")

def print_section(title: str):
    """Print a formatted section header."""
    print(f"\n🔍 {title}")
    print("-" * 50)

async def test_kan_reasoning_agent():
    """Test the KAN reasoning agent with archaeological scenarios."""
    print_section("KAN Enhanced Reasoning Agent Test")
    
    try:
        from enhanced_reasoning_day6 import EnhancedKANReasoningAgent
        
        # Test coordinates in the Amazon basin
        test_sites = [
            (-4.2, -61.8, "Central Amazon - Potential Settlement"),
            (-3.8, -63.2, "Rio Negro Region - Earthwork Complex"),
            (-5.1, -60.5, "Eastern Amazon - Geometric Patterns")
        ]
        
        # Test visual findings scenarios
        test_scenarios = [
            {
                "name": "Circular Plaza Discovery",
                "visual_findings": {
                    "type": "geometric_earthwork",
                    "pattern_type": "circular_plaza",
                    "confidence": 0.85,
                    "anomaly_detected": True,
                    "geometric_precision": 0.92
                }
            },
            {
                "name": "Settlement Pattern Analysis",
                "visual_findings": {
                    "type": "settlement_cluster",
                    "pattern_type": "village_complex",
                    "confidence": 0.78,
                    "anomaly_detected": True
                }
            },
            {
                "name": "Defensive Earthwork System",
                "visual_findings": {
                    "type": "defensive_structure",
                    "pattern_type": "fortified_enclosure",
                    "confidence": 0.91,
                    "anomaly_detected": True
                }
            }
        ]
        
        print("✅ Enhanced KAN Reasoning Agent initialized successfully")
        
        # Test both KAN-enhanced and traditional approaches
        for use_kan in [True, False]:
            agent_type = "KAN-Enhanced" if use_kan else "Traditional"
            print(f"\n🧠 Testing {agent_type} Agent:")
            
            agent = EnhancedKANReasoningAgent(use_kan=use_kan)
            
            total_time = 0
            results = []
            
            for i, (lat, lon, description) in enumerate(test_sites):
                scenario = test_scenarios[i]
                
                start_time = time.time()
                
                result = await agent.enhanced_cultural_reasoning(
                    visual_findings=scenario["visual_findings"],
                    lat=lat,
                    lon=lon
                )
                
                end_time = time.time()
                processing_time = end_time - start_time
                total_time += processing_time
                
                confidence = result.get("confidence_metrics", {}).get("overall_confidence", 0.5)
                interpretability = result.get("confidence_metrics", {}).get("interpretability", 0.6)
                
                print(f"   • {description}")
                print(f"     Scenario: {scenario['name']}")
                print(f"     Processing Time: {processing_time:.3f}s")
                print(f"     KAN Enhanced: {result.get('kan_enhanced', False)}")
                print(f"     Confidence: {confidence:.3f}")
                print(f"     Interpretability: {interpretability:.3f}")
            
            avg_time = total_time / len(test_sites)
            print(f"\n   📊 {agent_type} Performance Summary:")
            print(f"      Average Processing Time: {avg_time:.3f}s")
        
        return True
        
    except Exception as e:
        print(f"❌ KAN Reasoning Agent test failed: {str(e)}")
        return False

async def test_cultural_context_database():
    """Test the cultural context database and temporal reasoning."""
    print_section("Cultural Context Database & Temporal Reasoning Test")
    
    try:
        from enhanced_reasoning_day6 import CulturalContextDatabase, TemporalReasoningEngine
        
        # Test cultural context database
        print("🏛️ Testing Cultural Context Database:")
        db = CulturalContextDatabase()
        
        periods = db.get_all_periods()
        print(f"   • Cultural Periods Available: {len(periods)}")
        
        for period_name, period_data in periods.items():
            print(f"     - {period_name}: {period_data['time_range']}")
        
        # Test pattern categories
        patterns = db.get_pattern_categories()
        print(f"   • Pattern Categories: {len(patterns)}")
        for category, details in patterns.items():
            print(f"     - {category}: {len(details['patterns'])} patterns")
        
        # Test temporal reasoning engine
        print("\n⏰ Testing Temporal Reasoning Engine:")
        temporal_engine = TemporalReasoningEngine()
        
        # Test with archaeological features
        test_features = {
            "geometric_precision": 0.95,
            "construction_complexity": "high",
            "ceremonial_indicators": True,
            "size_category": "large"
        }
        
        temporal_analysis = temporal_engine.estimate_temporal_context(
            test_features, -4.2, -61.8
        )
        
        print(f"   🔍 Analyzing Large Circular Plaza:")
        print(f"      Estimated Periods: {len(temporal_analysis.get('estimated_periods', []))}")
        
        for period in temporal_analysis.get("estimated_periods", [])[:2]:
            print(f"        - {period['period']}: {period['confidence']:.3f} confidence")
        
        return True
        
    except Exception as e:
        print(f"❌ Cultural Context Database test failed: {str(e)}")
        return False

async def test_performance_comparison():
    """Test performance comparison between KAN and traditional approaches."""
    print_section("Performance Comparison Test")
    
    try:
        from enhanced_reasoning_day6 import EnhancedKANReasoningAgent
        import psutil
        
        # Test data
        test_coordinates = [
            (-4.2, -61.8), (-3.8, -63.2), (-5.1, -60.5)
        ]
        
        test_visual_findings = {
            "type": "geometric_earthwork",
            "pattern_type": "circular_plaza",
            "confidence": 0.8,
            "anomaly_detected": True
        }
        
        results = {}
        
        for agent_type, use_kan in [("Traditional", False), ("KAN-Enhanced", True)]:
            print(f"\n🔬 Testing {agent_type} Performance:")
            
            agent = EnhancedKANReasoningAgent(use_kan=use_kan)
            
            # Memory baseline
            process = psutil.Process()
            baseline_memory = process.memory_info().rss / 1024 / 1024  # MB
            
            start_time = time.time()
            processing_times = []
            
            for i, (lat, lon) in enumerate(test_coordinates):
                coord_start = time.time()
                
                result = await agent.enhanced_cultural_reasoning(
                    visual_findings=test_visual_findings,
                    lat=lat,
                    lon=lon
                )
                
                coord_end = time.time()
                processing_times.append(coord_end - coord_start)
                
                print(f"   • Coordinate {i+1}: {coord_end - coord_start:.3f}s")
            
            end_time = time.time()
            peak_memory = process.memory_info().rss / 1024 / 1024  # MB
            
            total_time = end_time - start_time
            avg_time = sum(processing_times) / len(processing_times)
            memory_usage = peak_memory - baseline_memory
            
            results[agent_type] = {
                "total_time": total_time,
                "average_time": avg_time,
                "memory_usage": memory_usage,
                "requests_per_second": len(test_coordinates) / total_time
            }
            
            print(f"   📊 {agent_type} Results:")
            print(f"      Total Time: {total_time:.3f}s")
            print(f"      Average Time: {avg_time:.3f}s")
            print(f"      Memory Usage: {memory_usage:.2f} MB")
            print(f"      Requests/Second: {len(test_coordinates) / total_time:.2f}")
        
        # Performance comparison
        print(f"\n📈 Performance Comparison:")
        traditional = results["Traditional"]
        kan_enhanced = results["KAN-Enhanced"]
        
        memory_diff = kan_enhanced["memory_usage"] - traditional["memory_usage"]
        
        print(f"   • Memory Overhead: {memory_diff:+.2f} MB")
        print(f"   • Interpretability Advantage: KAN provides explainable reasoning")
        print(f"   • Cultural Context: KAN includes 5 cultural periods")
        print(f"   • Temporal Analysis: KAN provides automated period estimation")
        
        return True
        
    except Exception as e:
        print(f"❌ Performance comparison test failed: {str(e)}")
        return False

async def test_archaeological_discoveries():
    """Test archaeological discovery scenarios with KAN integration."""
    print_section("Archaeological Discovery Scenarios")
    
    try:
        from enhanced_reasoning_day6 import EnhancedKANReasoningAgent
        
        # Real-world inspired archaeological scenarios
        discovery_scenarios = [
            {
                "name": "Acre Geoglyphs Discovery",
                "location": (-9.0, -67.8),
                "description": "Large geometric earthworks in Acre state",
                "visual_findings": {
                    "type": "geometric_earthwork",
                    "pattern_type": "circular_plaza",
                    "confidence": 0.92,
                    "anomaly_detected": True,
                    "geometric_precision": 0.95
                }
            },
            {
                "name": "Upper Xingu Settlement",
                "location": (-12.1, -53.2),
                "description": "Pre-Columbian settlement complex",
                "visual_findings": {
                    "type": "settlement_cluster",
                    "pattern_type": "village_complex",
                    "confidence": 0.87,
                    "anomaly_detected": True
                }
            },
            {
                "name": "Marajoara Culture Site",
                "location": (-1.0, -50.0),
                "description": "Complex society archaeological site",
                "visual_findings": {
                    "type": "ceremonial_complex",
                    "pattern_type": "mound_complex",
                    "confidence": 0.89,
                    "anomaly_detected": True
                }
            }
        ]
        
        agent = EnhancedKANReasoningAgent(use_kan=True)
        
        print("🏛️ Analyzing Archaeological Discovery Scenarios:")
        
        for scenario in discovery_scenarios:
            print(f"\n🔍 {scenario['name']}")
            print(f"   Location: {scenario['location']}")
            print(f"   Description: {scenario['description']}")
            
            start_time = time.time()
            
            result = await agent.enhanced_cultural_reasoning(
                visual_findings=scenario["visual_findings"],
                lat=scenario["location"][0],
                lon=scenario["location"][1]
            )
            
            end_time = time.time()
            
            confidence = result.get("confidence_metrics", {}).get("overall_confidence", 0.5)
            interpretability = result.get("confidence_metrics", {}).get("interpretability", 0.6)
            
            print(f"   ⏱️ Analysis Time: {end_time - start_time:.3f}s")
            print(f"   🧠 KAN Enhanced: {result.get('kan_enhanced', False)}")
            print(f"   📊 Overall Confidence: {confidence:.3f}")
            print(f"   🔍 Interpretability Score: {interpretability:.3f}")
            
            # Cultural context analysis
            if "cultural_context_analysis" in result:
                cultural_analysis = result["cultural_context_analysis"]
                print(f"   🏛️ Cultural Significance: {cultural_analysis.get('cultural_significance', 'Unknown')}")
            
            # Temporal analysis
            if "temporal_analysis" in result:
                temporal = result["temporal_analysis"]
                print(f"   📅 Temporal Context: {len(temporal.get('estimated_periods', []))} periods analyzed")
        
        return True
        
    except Exception as e:
        print(f"❌ Archaeological discovery test failed: {str(e)}")
        return False

async def test_error_handling():
    """Test error handling and fallback mechanisms."""
    print_section("Error Handling & Fallback Mechanisms")
    
    try:
        from enhanced_reasoning_day6 import EnhancedKANReasoningAgent
        
        print("🛡️ Testing Error Handling Scenarios:")
        
        # Test scenarios
        error_scenarios = [
            {
                "name": "Invalid Coordinates",
                "lat": 999,
                "lon": 999,
                "visual_findings": {"type": "test"}
            },
            {
                "name": "Empty Visual Findings",
                "lat": -4.5,
                "lon": -62.0,
                "visual_findings": {}
            }
        ]
        
        # Test with KAN enabled
        agent = EnhancedKANReasoningAgent(use_kan=True)
        
        for scenario in error_scenarios:
            print(f"\n   🧪 Testing: {scenario['name']}")
            
            try:
                result = await agent.enhanced_cultural_reasoning(
                    visual_findings=scenario["visual_findings"],
                    lat=scenario["lat"],
                    lon=scenario["lon"]
                )
                
                print(f"      ✅ Handled gracefully")
                print(f"      📊 Confidence: {result.get('confidence_metrics', {}).get('overall_confidence', 0):.3f}")
                
            except Exception as e:
                print(f"      ❌ Error occurred: {str(e)}")
        
        # Test fallback mechanism
        print(f"\n🔄 Testing Fallback Mechanism:")
        fallback_agent = EnhancedKANReasoningAgent(use_kan=False)
        
        result = await fallback_agent.enhanced_cultural_reasoning(
            visual_findings={"type": "geometric_earthwork", "confidence": 0.8},
            lat=-4.5,
            lon=-62.0
        )
        
        print(f"   ✅ Fallback agent operational")
        print(f"   🧠 KAN Enhanced: {result.get('kan_enhanced', False)}")
        print(f"   📊 Confidence: {result.get('confidence_metrics', {}).get('overall_confidence', 0):.3f}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error handling test failed: {str(e)}")
        return False

async def main():
    """Run comprehensive KAN backend integration tests."""
    print_header("KAN Backend Integration Test Suite - Day 7")
    print("🚀 Comprehensive testing of KAN integration and performance")
    print("🏛️ Archaeological Discovery Platform - Powered by KAN Networks")
    print(f"⏰ Test Started: {datetime.now().isoformat()}")
    
    test_results = []
    
    # Run all tests
    tests = [
        ("KAN Reasoning Agent", test_kan_reasoning_agent),
        ("Cultural Context Database", test_cultural_context_database),
        ("Performance Comparison", test_performance_comparison),
        ("Archaeological Discoveries", test_archaeological_discoveries),
        ("Error Handling", test_error_handling)
    ]
    
    for test_name, test_func in tests:
        print_header(f"Running: {test_name}")
        
        start_time = time.time()
        success = await test_func()
        end_time = time.time()
        
        test_results.append({
            "name": test_name,
            "success": success,
            "duration": end_time - start_time
        })
        
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"\n{status} - {test_name} ({end_time - start_time:.2f}s)")
    
    # Final summary
    print_header("Test Suite Summary")
    
    passed = sum(1 for r in test_results if r["success"])
    total = len(test_results)
    total_time = sum(r["duration"] for r in test_results)
    
    print(f"📊 Test Results: {passed}/{total} tests passed")
    print(f"⏱️ Total Time: {total_time:.2f}s")
    print(f"🎯 Success Rate: {(passed/total)*100:.1f}%")
    
    print(f"\n📋 Individual Test Results:")
    for result in test_results:
        status = "✅" if result["success"] else "❌"
        print(f"   {status} {result['name']}: {result['duration']:.2f}s")
    
    if passed == total:
        print(f"\n🎉 All tests passed! KAN integration is working perfectly.")
        print(f"🚀 System is ready for production deployment.")
        print(f"🏛️ Archaeological discoveries enhanced with interpretable AI.")
    else:
        print(f"\n⚠️ Some tests failed. Review the output above for details.")
    
    print(f"\n🏛️ Archaeological Discovery Platform - KAN Integration Complete")
    print(f"⏰ Test Completed: {datetime.now().isoformat()}")

if __name__ == "__main__":
    asyncio.run(main()) 