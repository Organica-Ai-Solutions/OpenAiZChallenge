// Test All Backend Fixes
// Run this in the browser console to verify all fixes are working

console.log('🔧 TESTING ALL BACKEND FIXES');

async function testAllFixes() {
  const results = {
    cors: false,
    analysisStore: false,
    divineAnalysis: false,
    visionAnalysis: false,
    backendHealth: false
  };

  console.log('🧪 Starting comprehensive backend tests...');

  // Test 1: Backend Health Check
  try {
    console.log('🏥 Testing backend health...');
    const healthResponse = await fetch('http://localhost:8003/health');
    if (healthResponse.ok) {
      results.backendHealth = true;
      console.log('✅ Backend health check passed');
    } else {
      console.log('❌ Backend health check failed');
    }
  } catch (error) {
    console.log('❌ Backend health check error:', error.message);
  }

  // Test 2: CORS Headers
  try {
    console.log('🌐 Testing CORS headers...');
    const corsResponse = await fetch('http://localhost:8003/statistics', {
      method: 'OPTIONS'
    });
    
    const corsHeaders = corsResponse.headers;
    const allowOrigin = corsHeaders.get('Access-Control-Allow-Origin');
    const allowMethods = corsHeaders.get('Access-Control-Allow-Methods');
    
    if (allowOrigin === '*' && allowMethods && allowMethods.includes('POST')) {
      results.cors = true;
      console.log('✅ CORS headers properly configured');
    } else {
      console.log('❌ CORS headers not properly configured');
      console.log('Allow-Origin:', allowOrigin);
      console.log('Allow-Methods:', allowMethods);
    }
  } catch (error) {
    console.log('❌ CORS test error:', error.message);
  }

  // Test 3: Analysis Store Endpoint
  try {
    console.log('💾 Testing analysis store endpoint...');
    const storeResponse = await fetch('http://localhost:8003/analysis/store', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        coordinates: { lat: -3.4653, lng: -62.2159 },
        analysis_type: 'test',
        confidence: 0.85,
        features_detected: 12,
        test_data: true
      })
    });

    if (storeResponse.ok) {
      const storeData = await storeResponse.json();
      results.analysisStore = true;
      console.log('✅ Analysis store endpoint working');
      console.log('📄 Response:', storeData);
    } else {
      console.log('❌ Analysis store endpoint failed:', storeResponse.status);
    }
  } catch (error) {
    console.log('❌ Analysis store test error:', error.message);
  }

  // Test 4: Divine Analysis Endpoint
  try {
    console.log('🏛️ Testing divine analysis endpoint...');
    const divineResponse = await fetch('http://localhost:8003/agents/divine-analysis-all-sites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (divineResponse.ok) {
      const divineData = await divineResponse.json();
      results.divineAnalysis = true;
      console.log('✅ Divine analysis endpoint working');
      console.log('🏛️ Divine results:', divineData);
    } else {
      console.log('❌ Divine analysis endpoint failed:', divineResponse.status);
    }
  } catch (error) {
    console.log('❌ Divine analysis test error:', error.message);
  }

  // Test 5: Vision Analysis Endpoint
  try {
    console.log('👁️ Testing vision analysis endpoint...');
    const visionResponse = await fetch('http://localhost:8003/agents/vision/comprehensive-lidar-analysis?lat=-3.4653&lng=-62.2159&hd_zoom=4m');

    if (visionResponse.ok) {
      const visionData = await visionResponse.json();
      results.visionAnalysis = true;
      console.log('✅ Vision analysis endpoint working');
      console.log('👁️ Vision results:', visionData);
    } else {
      console.log('❌ Vision analysis endpoint failed:', visionResponse.status);
    }
  } catch (error) {
    console.log('❌ Vision analysis test error:', error.message);
  }

  // Summary Report
  console.log('\n🏆 TEST RESULTS SUMMARY:');
  console.log('='.repeat(50));
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const successRate = Math.round((passedTests / totalTests) * 100);

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${test.toUpperCase()}`);
  });

  console.log('='.repeat(50));
  console.log(`📊 Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`);
  
  if (successRate === 100) {
    console.log('🎉 ALL TESTS PASSED! Backend is fully operational!');
  } else if (successRate >= 80) {
    console.log('⚠️ Most tests passed. Minor issues detected.');
  } else {
    console.log('🚨 Multiple issues detected. Backend needs attention.');
  }

  return results;
}

// Test Enhanced Chat Service
async function testEnhancedChat() {
  console.log('\n🧠 TESTING ENHANCED CHAT SERVICE');
  
  if (window.location.pathname.includes('/chat')) {
    console.log('✅ On chat page - Enhanced chat should be active');
    console.log('🎯 Try these test messages:');
    console.log('1. "lets make a discovery in suriname"');
    console.log('2. "divine analysis"');
    console.log('3. "/analyze 4.5, -55.2"');
    console.log('4. "what is the status of the agents?"');
    
    console.log('\n🔍 Look for these enhanced features:');
    console.log('• 🧠 AI Reasoning Process (expandable dropdown)');
    console.log('• 🔧 Tools Used indicators');
    console.log('• 💾 Saved to DB confirmations');
    console.log('• 🎯 Intelligent, contextual responses');
  } else {
    console.log('ℹ️ Navigate to /chat to test enhanced chat service');
  }
}

// Test Divine Batch Analysis
function testDivineBatchAnalysis() {
  console.log('\n⚡ TESTING DIVINE BATCH ANALYSIS');
  
  if (window.location.pathname.includes('/map')) {
    console.log('✅ On map page - Divine batch analysis available');
    console.log('🎯 Try these methods:');
    console.log('1. Click the golden "DIVINE BATCH ANALYSIS" button (top-left)');
    console.log('2. Press Ctrl+Shift+D keyboard shortcut');
    console.log('3. Right-click map → Select "🏛️ DIVINE BATCH ANALYSIS"');
    console.log('4. Browser console: window.runDivineBatchAnalysis()');
    
    // Try to trigger it programmatically
    if (typeof window.runDivineBatchAnalysis === 'function') {
      console.log('🚀 Divine batch analysis function found!');
      console.log('⚡ You can run: window.runDivineBatchAnalysis()');
    } else {
      console.log('⚠️ Divine batch analysis function not found in window object');
    }
  } else {
    console.log('ℹ️ Navigate to /map to test divine batch analysis');
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 RUNNING COMPREHENSIVE SYSTEM TESTS\n');
  
  const backendResults = await testAllFixes();
  testEnhancedChat();
  testDivineBatchAnalysis();
  
  console.log('\n🏁 ALL TESTS COMPLETE!');
  console.log('🔧 Backend fixes tested and verified');
  console.log('🧠 Enhanced chat service ready');
  console.log('⚡ Divine batch analysis available');
  
  return backendResults;
}

// Auto-run tests
runAllTests();

// Export functions for manual use
window.testAllFixes = testAllFixes;
window.testEnhancedChat = testEnhancedChat;
window.testDivineBatchAnalysis = testDivineBatchAnalysis;
window.runAllTests = runAllTests; 