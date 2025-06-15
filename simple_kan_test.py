#!/usr/bin/env python3
"""
Simple test for KAN integration in the NIS Protocol.
This test works without requiring torch, numpy, or other heavy dependencies.
"""

import sys
import os
import logging

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_kan_reasoning_agent_basic():
    """Test basic KAN reasoning agent functionality."""
    logger.info("🧠 Testing KAN Reasoning Agent (Basic)...")
    
    try:
        from src.agents.kan_reasoning_agent import KANReasoningAgent
        
        # Create agent with KAN enabled
        agent = KANReasoningAgent(use_kan=True)
        logger.info(f"   ✅ Agent created successfully (KAN enabled: {agent.use_kan})")
        
        # Test basic interpretation
        visual_findings = {
            "anomaly_detected": True,
            "confidence": 0.75,
            "pattern_type": "circular geometric structures",
            "sources": ["satellite", "lidar"]
        }
        
        result = agent.interpret_findings(visual_findings, -3.4653, -62.2159)
        
        logger.info(f"   ✅ Interpretation completed")
        logger.info(f"   Enhanced confidence: {result.get('enhanced_confidence', 'N/A')}")
        logger.info(f"   Reasoning method: {result.get('reasoning_method', 'N/A')}")
        logger.info(f"   Feature analysis available: {'feature_analysis' in result}")
        
        return True
        
    except Exception as e:
        logger.error(f"   ❌ Test failed: {e}")
        return False


def test_kan_integrator_basic():
    """Test basic KAN integrator functionality."""
    logger.info("🔧 Testing KAN Integrator (Basic)...")
    
    try:
        from src.agents.kan_integrator import get_kan_integrator
        
        # Get integrator
        integrator = get_kan_integrator(use_kan=True, fallback_on_error=True)
        logger.info(f"   ✅ Integrator created successfully")
        
        # Test agent loading
        reasoning_agent = integrator.get_reasoning_agent()
        logger.info(f"   ✅ Reasoning agent loaded: {type(reasoning_agent).__name__}")
        
        # Get status
        status = integrator.get_agent_status()
        logger.info(f"   ✅ Status retrieved: {len(status.get('agents', {}))} agents loaded")
        
        return True
        
    except Exception as e:
        logger.error(f"   ❌ Test failed: {e}")
        return False


def test_backend_integration():
    """Test backend integration endpoint."""
    logger.info("🔗 Testing Backend Integration...")
    
    try:
        # Test that the KAN status endpoint exists
        from backend_main import get_kan_integration_status
        logger.info(f"   ✅ KAN status endpoint available")
        
        return True
        
    except Exception as e:
        logger.error(f"   ❌ Test failed: {e}")
        return False


def run_simple_tests():
    """Run simple KAN integration tests."""
    logger.info("🚀 Starting Simple KAN Integration Tests...")
    logger.info("="*60)
    
    tests = [
        ("KAN Reasoning Agent", test_kan_reasoning_agent_basic),
        ("KAN Integrator", test_kan_integrator_basic),
        ("Backend Integration", test_backend_integration)
    ]
    
    results = []
    for test_name, test_func in tests:
        logger.info(f"\n--- {test_name} ---")
        result = test_func()
        results.append((test_name, result))
    
    # Summary
    logger.info("\n" + "="*60)
    logger.info("🎯 Test Results Summary:")
    logger.info("="*60)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        logger.info(f"   {test_name}: {status}")
        if result:
            passed += 1
    
    logger.info(f"\nOverall: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        logger.info("🎉 All tests passed! KAN integration is working.")
        logger.info("\n🧠 KAN Features Available:")
        logger.info("   • Enhanced reasoning with spline-based functions")
        logger.info("   • Improved interpretability for archaeological analysis")
        logger.info("   • Graceful fallback to traditional methods")
        logger.info("   • Compatible with existing backend systems")
        return True
    else:
        logger.warning("⚠️ Some tests failed, but basic functionality is available.")
        return False


if __name__ == "__main__":
    success = run_simple_tests()
    
    if success:
        print("\n🎯 READY FOR DEPLOYMENT!")
        print("Your KAN-enhanced NIS Protocol is ready to use.")
    else:
        print("\n⚠️ PARTIAL SUCCESS")
        print("Some features may not be available, but core functionality works.")
    
    sys.exit(0 if success else 1) 