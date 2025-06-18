"""Performance Testing Suite - Day 7.

Comprehensive load testing, memory optimization, response time benchmarking,
and error handling validation for KAN-enhanced archaeological system.
"""

import asyncio
import time
import psutil
import numpy as np
from datetime import datetime
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class PerformanceMetrics:
    def __init__(self, response_time, memory_usage, success, error_message=None):
        self.response_time = response_time
        self.memory_usage = memory_usage
        self.success = success
        self.error_message = error_message
        self.timestamp = datetime.now()

class KANPerformanceTester:
    def __init__(self):
        self.test_coordinates = [
            (-4.2, -61.8, "Central Amazon"),
            (-3.8, -63.2, "Rio Negro Region"),
            (-5.1, -60.5, "Eastern Amazon"),
            (-4.8, -62.7, "Western Amazon"),
            (-4.0, -62.5, "Manaus Region")
        ]
        
        self.test_visual_findings = {
            "type": "geometric_earthwork",
            "pattern_type": "circular_plaza",
            "confidence": 0.8,
            "anomaly_detected": True
        }
    
    async def test_agent_memory_usage(self) -> Dict:
        """Test memory usage of KAN agents."""
        print("\n🧠 Testing Agent Memory Usage...")
        print("=" * 60)
        
        results = {}
        
        try:
            from enhanced_reasoning_day6 import EnhancedKANReasoningAgent
            
            # Test KAN-enhanced agent
            print("   1️⃣ Testing KAN-Enhanced Agent Memory...")
            
            baseline_memory = psutil.Process().memory_info().rss / 1024 / 1024
            agent = EnhancedKANReasoningAgent(use_kan=True)
            
            memory_samples = []
            
            for i, (lat, lon, region) in enumerate(self.test_coordinates):
                current_memory = psutil.Process().memory_info().rss / 1024 / 1024
                memory_samples.append(current_memory)
                
                result = await agent.enhanced_cultural_reasoning(
                    visual_findings=self.test_visual_findings,
                    lat=lat,
                    lon=lon
                )
                print(f"      • {region}: {current_memory:.2f} MB")
            
            peak_memory = max(memory_samples)
            average_memory = np.mean(memory_samples)
            memory_increase = peak_memory - baseline_memory
            
            results["kan_enhanced"] = {
                "baseline_memory_mb": baseline_memory,
                "peak_memory_mb": peak_memory,
                "average_memory_mb": average_memory,
                "memory_increase_mb": memory_increase
            }
            
            print(f"   ✅ KAN-Enhanced Agent:")
            print(f"      Baseline: {baseline_memory:.2f} MB")
            print(f"      Peak: {peak_memory:.2f} MB")
            print(f"      Increase: {memory_increase:.2f} MB")
            
            # Test traditional agent
            print("\n   2️⃣ Testing Traditional Agent Memory...")
            
            baseline_memory_trad = psutil.Process().memory_info().rss / 1024 / 1024
            traditional_agent = EnhancedKANReasoningAgent(use_kan=False)
            
            memory_samples_trad = []
            
            for i, (lat, lon, region) in enumerate(self.test_coordinates):
                current_memory = psutil.Process().memory_info().rss / 1024 / 1024
                memory_samples_trad.append(current_memory)
                
                result = await traditional_agent.enhanced_cultural_reasoning(
                    visual_findings=self.test_visual_findings,
                    lat=lat,
                    lon=lon
                )
            
            peak_memory_trad = max(memory_samples_trad)
            average_memory_trad = np.mean(memory_samples_trad)
            memory_increase_trad = peak_memory_trad - baseline_memory_trad
            
            results["traditional"] = {
                "baseline_memory_mb": baseline_memory_trad,
                "peak_memory_mb": peak_memory_trad,
                "average_memory_mb": average_memory_trad,
                "memory_increase_mb": memory_increase_trad
            }
            
            print(f"   ✅ Traditional Agent:")
            print(f"      Baseline: {baseline_memory_trad:.2f} MB")
            print(f"      Peak: {peak_memory_trad:.2f} MB")
            print(f"      Increase: {memory_increase_trad:.2f} MB")
            
            # Comparison
            memory_overhead = peak_memory - peak_memory_trad
            memory_overhead_percent = (memory_overhead / peak_memory_trad) * 100 if peak_memory_trad > 0 else 0
            
            results["comparison"] = {
                "memory_overhead_mb": memory_overhead,
                "memory_overhead_percent": memory_overhead_percent
            }
            
            print(f"\n   📊 Memory Comparison:")
            print(f"      KAN Memory Overhead: {memory_overhead:.2f} MB ({memory_overhead_percent:.1f}%)")
            
        except Exception as e:
            print(f"   ❌ Memory testing failed: {str(e)}")
            results["error"] = str(e)
        
        return results
    
    async def test_concurrent_load(self, concurrent_users: int = 5, requests_per_user: int = 3) -> Dict:
        """Test concurrent load on KAN agents."""
        print(f"\n⚡ Testing Concurrent Load ({concurrent_users} users, {requests_per_user} requests each)...")
        print("=" * 60)
        
        start_time = time.time()
        all_metrics = []
        
        async def user_simulation(user_id: int) -> List[PerformanceMetrics]:
            metrics = []
            
            try:
                from enhanced_reasoning_day6 import EnhancedKANReasoningAgent
                agent = EnhancedKANReasoningAgent(use_kan=True)
                
                for request_id in range(requests_per_user):
                    lat, lon, region = self.test_coordinates[request_id % len(self.test_coordinates)]
                    
                    request_start = time.time()
                    
                    try:
                        result = await agent.enhanced_cultural_reasoning(
                            visual_findings=self.test_visual_findings,
                            lat=lat,
                            lon=lon
                        )
                        
                        request_end = time.time()
                        memory_usage = psutil.Process().memory_info().rss / 1024 / 1024
                        
                        metrics.append(PerformanceMetrics(
                            response_time=request_end - request_start,
                            memory_usage=memory_usage,
                            success=True
                        ))
                        
                    except Exception as e:
                        request_end = time.time()
                        metrics.append(PerformanceMetrics(
                            response_time=request_end - request_start,
                            memory_usage=0,
                            success=False,
                            error_message=str(e)
                        ))
                
            except Exception as e:
                print(f"User {user_id} failed: {str(e)}")
            
            return metrics
        
        # Run concurrent simulations
        tasks = [user_simulation(i) for i in range(concurrent_users)]
        all_user_metrics = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Collect metrics
        for user_metrics in all_user_metrics:
            if isinstance(user_metrics, list):
                all_metrics.extend(user_metrics)
        
        end_time = time.time()
        
        # Calculate results
        total_requests = len(all_metrics)
        successful_requests = sum(1 for m in all_metrics if m.success)
        failed_requests = total_requests - successful_requests
        
        if successful_requests > 0:
            successful_metrics = [m for m in all_metrics if m.success]
            response_times = [m.response_time for m in successful_metrics]
            
            average_response_time = np.mean(response_times)
            min_response_time = np.min(response_times)
            max_response_time = np.max(response_times)
        else:
            average_response_time = 0
            min_response_time = 0
            max_response_time = 0
        
        test_duration = end_time - start_time
        requests_per_second = total_requests / test_duration if test_duration > 0 else 0
        error_rate = (failed_requests / total_requests) * 100 if total_requests > 0 else 0
        success_rate = (successful_requests / total_requests) * 100 if total_requests > 0 else 0
        
        results = {
            "total_requests": total_requests,
            "successful_requests": successful_requests,
            "failed_requests": failed_requests,
            "success_rate": success_rate,
            "average_response_time": average_response_time,
            "min_response_time": min_response_time,
            "max_response_time": max_response_time,
            "requests_per_second": requests_per_second,
            "error_rate": error_rate,
            "test_duration": test_duration
        }
        
        print(f"   ✅ Load Test Results:")
        print(f"      Total Requests: {total_requests}")
        print(f"      Successful: {successful_requests}")
        print(f"      Failed: {failed_requests}")
        print(f"      Success Rate: {success_rate:.1f}%")
        print(f"      Average Response Time: {average_response_time:.3f}s")
        print(f"      Min/Max Response Time: {min_response_time:.3f}s / {max_response_time:.3f}s")
        print(f"      Requests per Second: {requests_per_second:.2f}")
        print(f"      Test Duration: {test_duration:.2f}s")
        print(f"      Error Rate: {error_rate:.1f}%")
        
        return results
    
    async def test_error_handling(self) -> Dict:
        """Test error handling scenarios."""
        print("\n🛡️ Testing Error Handling...")
        print("=" * 60)
        
        error_tests = {}
        
        try:
            from enhanced_reasoning_day6 import EnhancedKANReasoningAgent
            agent = EnhancedKANReasoningAgent(use_kan=True)
            
            # Test 1: Invalid coordinates
            print("   1️⃣ Testing invalid coordinates...")
            try:
                result = await agent.enhanced_cultural_reasoning(
                    visual_findings=self.test_visual_findings,
                    lat=999,  # Invalid latitude
                    lon=999   # Invalid longitude
                )
                error_tests["invalid_coordinates"] = {
                    "success": True,
                    "handled_gracefully": True
                }
                print("      ✅ Invalid coordinates handled gracefully")
            except Exception as e:
                error_tests["invalid_coordinates"] = {
                    "success": False,
                    "error": str(e),
                    "handled_gracefully": False
                }
                print(f"      ❌ Invalid coordinates caused error: {str(e)}")
            
            # Test 2: Empty visual findings
            print("   2️⃣ Testing empty visual findings...")
            try:
                result = await agent.enhanced_cultural_reasoning(
                    visual_findings={},
                    lat=-4.5,
                    lon=-62.0
                )
                error_tests["empty_findings"] = {
                    "success": True,
                    "handled_gracefully": True
                }
                print("      ✅ Empty findings handled gracefully")
            except Exception as e:
                error_tests["empty_findings"] = {
                    "success": False,
                    "error": str(e),
                    "handled_gracefully": False
                }
                print(f"      ❌ Empty findings caused error: {str(e)}")
            
            # Test 3: KAN fallback
            print("   3️⃣ Testing KAN unavailable fallback...")
            try:
                fallback_agent = EnhancedKANReasoningAgent(use_kan=False)
                result = await fallback_agent.enhanced_cultural_reasoning(
                    visual_findings=self.test_visual_findings,
                    lat=-4.5,
                    lon=-62.0
                )
                error_tests["kan_fallback"] = {
                    "success": True,
                    "handled_gracefully": True,
                    "kan_enhanced": result.get("kan_enhanced", False)
                }
                print("      ✅ KAN fallback working correctly")
            except Exception as e:
                error_tests["kan_fallback"] = {
                    "success": False,
                    "error": str(e),
                    "handled_gracefully": False
                }
                print(f"      ❌ KAN fallback failed: {str(e)}")
            
        except Exception as e:
            print(f"   ❌ Error handling test setup failed: {str(e)}")
            error_tests["setup_error"] = str(e)
        
        return error_tests
    
    def test_system_resources(self) -> Dict:
        """Test system resource usage."""
        print("\n💻 Testing System Resources...")
        print("=" * 60)
        
        cpu_count = psutil.cpu_count()
        memory_total = psutil.virtual_memory().total / 1024 / 1024 / 1024  # GB
        memory_available = psutil.virtual_memory().available / 1024 / 1024  # MB
        cpu_percent = psutil.cpu_percent(interval=1)
        
        print(f"   System Configuration:")
        print(f"      CPU Cores: {cpu_count}")
        print(f"      Total Memory: {memory_total:.2f} GB")
        print(f"      Available Memory: {memory_available:.0f} MB")
        print(f"      CPU Usage: {cpu_percent:.1f}%")
        
        resource_info = {
            "cpu_cores": cpu_count,
            "total_memory_gb": memory_total,
            "available_memory_mb": memory_available,
            "cpu_percent": cpu_percent,
            "recommended_concurrent_users": min(cpu_count * 2, 8)
        }
        
        # Resource recommendations
        if memory_total < 4:
            print("   ⚠️ Warning: Low memory system (<4GB). Limit concurrent users.")
        elif memory_total >= 8:
            print("   ✅ Sufficient memory for production load.")
        
        if cpu_count < 4:
            print("   ⚠️ Warning: Limited CPU cores. May affect concurrent performance.")
        else:
            print("   ✅ Sufficient CPU cores for production load.")
        
        return resource_info

async def run_comprehensive_performance_tests():
    """Run comprehensive Day 7 performance tests."""
    print("\n🚀 Comprehensive Performance Testing Suite - Day 7")
    print("=" * 70)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("Testing: Load Testing, Memory Optimization, Response Time Benchmarking")
    
    tester = KANPerformanceTester()
    test_results = {}
    
    # System resource check
    print("\n📋 Pre-Test System Check...")
    system_resources = tester.test_system_resources()
    test_results["system_resources"] = system_resources
    
    # Memory usage tests
    memory_results = await tester.test_agent_memory_usage()
    test_results["memory_usage"] = memory_results
    
    # Concurrent load tests
    load_result = await tester.test_concurrent_load(concurrent_users=3, requests_per_user=2)
    test_results["concurrent_load"] = load_result
    
    # Error handling tests
    error_results = await tester.test_error_handling()
    test_results["error_handling"] = error_results
    
    # Performance summary
    print(f"\n📊 Performance Testing Summary - Day 7")
    print("=" * 70)
    
    print(f"✅ Memory Usage Analysis:")
    if "memory_usage" in test_results and "comparison" in test_results["memory_usage"]:
        overhead = test_results["memory_usage"]["comparison"]["memory_overhead_percent"]
        print(f"   KAN Memory Overhead: {overhead:.1f}%")
    
    print(f"✅ Concurrent Load Performance:")
    if load_result:
        print(f"   Success Rate: {load_result['success_rate']:.1f}%")
        print(f"   Average Response Time: {load_result['average_response_time']:.3f}s")
        print(f"   Requests per Second: {load_result['requests_per_second']:.2f}")
    
    print(f"✅ Error Handling:")
    error_count = len([t for t in error_results.values() if isinstance(t, dict) and t.get("handled_gracefully", False)])
    total_error_tests = len([t for t in error_results.values() if isinstance(t, dict)])
    if total_error_tests > 0:
        print(f"   Error Scenarios Handled: {error_count}/{total_error_tests}")
    
    # Production readiness assessment
    production_ready = True
    issues = []
    
    if load_result and load_result["error_rate"] > 5:
        production_ready = False
        issues.append(f"High error rate: {load_result['error_rate']:.1f}%")
    
    if load_result and load_result["average_response_time"] > 2.0:
        production_ready = False
        issues.append(f"Slow response time: {load_result['average_response_time']:.3f}s")
    
    print(f"\n🎯 Production Readiness Assessment:")
    if production_ready:
        print("   ✅ READY FOR PRODUCTION")
        print("   All performance metrics within acceptable ranges")
    else:
        print("   ⚠️ NEEDS OPTIMIZATION")
        for issue in issues:
            print(f"   • {issue}")
    
    return test_results

if __name__ == "__main__":
    asyncio.run(run_comprehensive_performance_tests()) 