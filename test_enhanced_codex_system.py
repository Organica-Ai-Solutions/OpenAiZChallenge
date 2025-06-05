#!/usr/bin/env python3
"""
Enhanced NIS Protocol Codex System Test Suite
Tests the complete codex discovery and analysis workflow
"""

import requests
import json
import time
from typing import Dict, List, Any

def test_frontend_pages():
    """Test that all frontend pages are accessible"""
    print("🌐 Testing Frontend Pages...")
    
    pages = [
        "http://localhost:3000/",
        "http://localhost:3000/codex-reader",
        "http://localhost:3000/agent",
        "http://localhost:3000/satellite",
        "http://localhost:3000/map",
        "http://localhost:3000/analytics",
        "http://localhost:3000/chat",
        "http://localhost:3000/documentation"
    ]
    
    results = []
    for page in pages:
        try:
            response = requests.get(page, timeout=5)
            status = "✅ PASS" if response.status_code == 200 else f"❌ FAIL ({response.status_code})"
            results.append({"page": page.split("/")[-1] or "home", "status": status})
            print(f"  {page.split('/')[-1] or 'home'}: {status}")
        except Exception as e:
            results.append({"page": page.split("/")[-1] or "home", "status": f"❌ ERROR: {str(e)}"})
            print(f"  {page.split('/')[-1] or 'home'}: ❌ ERROR: {str(e)}")
    
    return results

def test_backend_services():
    """Test backend service availability"""
    print("\n🔧 Testing Backend Services...")
    
    services = [
        {"name": "Main NIS Backend", "url": "http://localhost:8000/system/health"},
        {"name": "IKRP Codex Service", "url": "http://localhost:8001/"},
        {"name": "Codex Sources", "url": "http://localhost:8001/codex/sources"}
    ]
    
    results = []
    for service in services:
        try:
            response = requests.get(service["url"], timeout=5)
            if response.status_code == 200:
                status = "✅ ONLINE"
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else None
            else:
                status = f"❌ ERROR ({response.status_code})"
                data = None
            
            results.append({
                "service": service["name"],
                "status": status,
                "data": data
            })
            print(f"  {service['name']}: {status}")
            
        except Exception as e:
            results.append({
                "service": service["name"],
                "status": f"❌ OFFLINE: {str(e)}",
                "data": None
            })
            print(f"  {service['name']}: ❌ OFFLINE: {str(e)}")
    
    return results

def test_codex_discovery_workflow():
    """Test the complete codex discovery workflow"""
    print("\n📜 Testing Codex Discovery Workflow...")
    
    # Test coordinates (Amazon archaeological site)
    test_coordinates = {
        "lat": -3.4653,
        "lng": -62.2159
    }
    
    results = {}
    
    # Step 1: Test codex discovery
    print("  Step 1: Codex Discovery...")
    try:
        discovery_payload = {
            "coordinates": test_coordinates,
            "radius_km": 50,
            "period": "all",
            "sources": ["famsi", "world_digital_library", "inah"],
            "max_results": 10
        }
        
        response = requests.post(
            "http://localhost:8001/codex/discover",
            json=discovery_payload,
            timeout=10
        )
        
        if response.status_code == 200:
            discovery_data = response.json()
            results["discovery"] = {
                "status": "✅ SUCCESS",
                "total_found": discovery_data.get("total_codices_found", 0),
                "auto_analyzed": discovery_data.get("auto_analyzed", 0),
                "processing_time": discovery_data.get("search_metadata", {}).get("processing_time", "unknown"),
                "codices": discovery_data.get("codices", [])
            }
            print(f"    ✅ Found {discovery_data.get('total_codices_found', 0)} codices")
            print(f"    📊 Auto-analyzed: {discovery_data.get('auto_analyzed', 0)}")
        else:
            results["discovery"] = {
                "status": f"❌ FAILED ({response.status_code})",
                "error": response.text
            }
            print(f"    ❌ Discovery failed: {response.status_code}")
            
    except Exception as e:
        results["discovery"] = {
            "status": f"❌ ERROR: {str(e)}"
        }
        print(f"    ❌ Discovery error: {str(e)}")
    
    # Step 2: Test codex analysis (if discovery succeeded)
    print("  Step 2: Codex Analysis...")
    if results.get("discovery", {}).get("codices"):
        try:
            top_codex = results["discovery"]["codices"][0]
            
            analysis_payload = {
                "codex_id": top_codex["id"],
                "image_url": top_codex["image_url"],
                "coordinates": test_coordinates,
                "context": f"Archaeological analysis for {top_codex['title']}"
            }
            
            response = requests.post(
                "http://localhost:8001/codex/analyze",
                json=analysis_payload,
                timeout=15
            )
            
            if response.status_code == 200:
                analysis_data = response.json()
                results["analysis"] = {
                    "status": "✅ SUCCESS",
                    "codex_id": analysis_data.get("codex_id"),
                    "confidence": analysis_data.get("confidence", 0),
                    "processing_time": analysis_data.get("processing_time", 0),
                    "analysis": analysis_data.get("analysis", {})
                }
                print(f"    ✅ Analysis completed for {top_codex['title']}")
                print(f"    🎯 Confidence: {analysis_data.get('confidence', 0):.2%}")
            else:
                results["analysis"] = {
                    "status": f"❌ FAILED ({response.status_code})",
                    "error": response.text
                }
                print(f"    ❌ Analysis failed: {response.status_code}")
                
        except Exception as e:
            results["analysis"] = {
                "status": f"❌ ERROR: {str(e)}"
            }
            print(f"    ❌ Analysis error: {str(e)}")
    else:
        results["analysis"] = {
            "status": "⏭️ SKIPPED (no codices to analyze)"
        }
        print("    ⏭️ Skipped (no codices found)")
    
    # Step 3: Test workflow integration
    print("  Step 3: Workflow Integration...")
    try:
        # Test that the workflow produces actionable results
        if (results.get("discovery", {}).get("status", "").startswith("✅") and 
            results.get("analysis", {}).get("status", "").startswith("✅")):
            
            analysis_data = results["analysis"]["analysis"]
            recommendations = analysis_data.get("recommendations", {})
            archaeological_insights = analysis_data.get("archaeological_insights", {})
            
            workflow_score = 0
            if recommendations:
                workflow_score += 30
            if archaeological_insights:
                workflow_score += 30
            if analysis_data.get("visual_elements"):
                workflow_score += 20
            if analysis_data.get("textual_content"):
                workflow_score += 20
            
            results["workflow"] = {
                "status": "✅ SUCCESS",
                "integration_score": workflow_score,
                "recommendations_available": bool(recommendations),
                "archaeological_insights": bool(archaeological_insights),
                "visual_analysis": bool(analysis_data.get("visual_elements")),
                "textual_analysis": bool(analysis_data.get("textual_content"))
            }
            print(f"    ✅ Workflow integration score: {workflow_score}/100")
        else:
            results["workflow"] = {
                "status": "❌ INCOMPLETE (discovery or analysis failed)"
            }
            print("    ❌ Workflow incomplete")
            
    except Exception as e:
        results["workflow"] = {
            "status": f"❌ ERROR: {str(e)}"
        }
        print(f"    ❌ Workflow error: {str(e)}")
    
    return results

def test_ui_integration():
    """Test UI integration points"""
    print("\n🎨 Testing UI Integration...")
    
    results = {}
    
    # Test that codex reader page loads
    try:
        response = requests.get("http://localhost:3000/codex-reader", timeout=5)
        if response.status_code == 200:
            results["codex_reader_page"] = "✅ ACCESSIBLE"
            print("  ✅ Codex Reader page accessible")
        else:
            results["codex_reader_page"] = f"❌ ERROR ({response.status_code})"
            print(f"  ❌ Codex Reader page error: {response.status_code}")
    except Exception as e:
        results["codex_reader_page"] = f"❌ ERROR: {str(e)}"
        print(f"  ❌ Codex Reader page error: {str(e)}")
    
    # Test that agent page loads (contains codex tab)
    try:
        response = requests.get("http://localhost:3000/agent", timeout=5)
        if response.status_code == 200:
            results["agent_page"] = "✅ ACCESSIBLE"
            print("  ✅ Agent page (with codex tab) accessible")
        else:
            results["agent_page"] = f"❌ ERROR ({response.status_code})"
            print(f"  ❌ Agent page error: {response.status_code}")
    except Exception as e:
        results["agent_page"] = f"❌ ERROR: {str(e)}"
        print(f"  ❌ Agent page error: {str(e)}")
    
    return results

def generate_summary_report(all_results: Dict[str, Any]):
    """Generate a comprehensive summary report"""
    print("\n" + "="*60)
    print("📊 ENHANCED CODEX SYSTEM TEST SUMMARY")
    print("="*60)
    
    total_tests = 0
    passed_tests = 0
    
    # Frontend tests
    frontend_results = all_results.get("frontend", [])
    frontend_passed = sum(1 for r in frontend_results if r["status"].startswith("✅"))
    total_tests += len(frontend_results)
    passed_tests += frontend_passed
    print(f"\n🌐 Frontend Pages: {frontend_passed}/{len(frontend_results)} passed")
    
    # Backend tests
    backend_results = all_results.get("backend", [])
    backend_passed = sum(1 for r in backend_results if r["status"].startswith("✅"))
    total_tests += len(backend_results)
    passed_tests += backend_passed
    print(f"🔧 Backend Services: {backend_passed}/{len(backend_results)} online")
    
    # Codex workflow tests
    workflow_results = all_results.get("codex_workflow", {})
    workflow_tests = ["discovery", "analysis", "workflow"]
    workflow_passed = sum(1 for test in workflow_tests if workflow_results.get(test, {}).get("status", "").startswith("✅"))
    total_tests += len(workflow_tests)
    passed_tests += workflow_passed
    print(f"📜 Codex Workflow: {workflow_passed}/{len(workflow_tests)} components working")
    
    # UI integration tests
    ui_results = all_results.get("ui_integration", {})
    ui_tests = ["codex_reader_page", "agent_page"]
    ui_passed = sum(1 for test in ui_tests if ui_results.get(test, "").startswith("✅"))
    total_tests += len(ui_tests)
    passed_tests += ui_passed
    print(f"🎨 UI Integration: {ui_passed}/{len(ui_tests)} pages accessible")
    
    # Overall score
    success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
    print(f"\n🎯 Overall Success Rate: {success_rate:.1f}% ({passed_tests}/{total_tests})")
    
    # Status indicator
    if success_rate >= 90:
        status = "🟢 EXCELLENT"
    elif success_rate >= 75:
        status = "🟡 GOOD"
    elif success_rate >= 50:
        status = "🟠 NEEDS IMPROVEMENT"
    else:
        status = "🔴 CRITICAL ISSUES"
    
    print(f"📈 System Status: {status}")
    
    # Key findings
    print(f"\n🔍 Key Findings:")
    
    if workflow_results.get("discovery", {}).get("total_found", 0) > 0:
        print(f"  ✅ Codex discovery functional - found {workflow_results['discovery']['total_found']} codices")
    
    if workflow_results.get("analysis", {}).get("confidence", 0) > 0:
        print(f"  ✅ GPT-4.1 Vision analysis working - {workflow_results['analysis']['confidence']:.1%} confidence")
    
    if workflow_results.get("workflow", {}).get("integration_score", 0) >= 80:
        print(f"  ✅ Complete workflow integration - {workflow_results['workflow']['integration_score']}/100 score")
    
    if backend_passed == len(backend_results):
        print(f"  ✅ All backend services operational")
    
    if frontend_passed == len(frontend_results):
        print(f"  ✅ All frontend pages accessible")
    
    print("\n" + "="*60)
    
    return {
        "total_tests": total_tests,
        "passed_tests": passed_tests,
        "success_rate": success_rate,
        "status": status
    }

def main():
    """Run the complete test suite"""
    print("🚀 Starting Enhanced NIS Protocol Codex System Tests")
    print("=" * 60)
    
    all_results = {}
    
    # Run all test suites
    all_results["frontend"] = test_frontend_pages()
    all_results["backend"] = test_backend_services()
    all_results["codex_workflow"] = test_codex_discovery_workflow()
    all_results["ui_integration"] = test_ui_integration()
    
    # Generate summary
    summary = generate_summary_report(all_results)
    
    # Save detailed results
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    results_file = f"test_results_enhanced_codex_{timestamp}.json"
    
    with open(results_file, 'w') as f:
        json.dump({
            "timestamp": timestamp,
            "summary": summary,
            "detailed_results": all_results
        }, f, indent=2)
    
    print(f"\n💾 Detailed results saved to: {results_file}")
    
    return summary["success_rate"] >= 75

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 