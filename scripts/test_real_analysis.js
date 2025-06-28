#!/usr/bin/env node

const BASE_URL = 'http://localhost:8003';

// Test coordinates for Suriname discovery
const TEST_COORDINATES = [
    { lat: 5.8663, lon: -55.1668, name: "Paramaribo Region" },
    { lat: 4.0, lon: -56.0, name: "Interior Suriname" },
    { lat: 3.5, lon: -57.5, name: "Southern Suriname" }
];

async function testRealAnalysis() {
    console.log('🔬 TESTING REAL ANALYSIS SYSTEM');
    console.log('================================\n');

    // Test 1: Health Check
    console.log('1️⃣ Testing Backend Health...');
    try {
        const healthResponse = await fetch(`${BASE_URL}/system/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Backend Health:', healthData.status);
        console.log('📊 Services:', Object.keys(healthData.services || {}));
    } catch (error) {
        console.log('❌ Backend Health Failed:', error.message);
        return;
    }

    // Test 2: Real Analysis (not hardcoded)
    console.log('\n2️⃣ Testing Real Analysis...');
    for (const coord of TEST_COORDINATES) {
        console.log(`\n🎯 Analyzing ${coord.name} (${coord.lat}, ${coord.lon})`);
        
        try {
            const analysisResponse = await fetch(`${BASE_URL}/analysis/comprehensive`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    coordinates: { lat: coord.lat, lng: coord.lon },
                    radius: 1000,
                    analysis_type: 'full'
                })
            });

            if (analysisResponse.ok) {
                const analysisData = await analysisResponse.json();
                
                // Check if this looks like real analysis vs hardcoded
                const isRealAnalysis = checkIfRealAnalysis(analysisData);
                
                if (isRealAnalysis) {
                    console.log('✅ REAL ANALYSIS DETECTED');
                    console.log(`   📍 Features found: ${analysisData.features_detected || 'N/A'}`);
                    console.log(`   🎯 Confidence: ${analysisData.confidence || 'N/A'}`);
                    console.log(`   🔍 Analysis ID: ${analysisData.analysis_id || 'N/A'}`);
                } else {
                    console.log('⚠️  HARDCODED/FAKE ANALYSIS DETECTED');
                    console.log('   This appears to be fallback data, not real analysis');
                }
            } else {
                console.log(`❌ Analysis failed: ${analysisResponse.status}`);
            }
        } catch (error) {
            console.log(`❌ Analysis error: ${error.message}`);
        }
    }

    // Test 3: Divine Analysis
    console.log('\n3️⃣ Testing Divine Analysis...');
    try {
        const divineResponse = await fetch(`${BASE_URL}/analysis/divine`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                coordinates: { lat: 5.8663, lng: -55.1668 },
                mode: 'enhanced'
            })
        });

        if (divineResponse.ok) {
            const divineData = await divineResponse.json();
            console.log('✅ Divine Analysis Response');
            console.log(`   🏛️ Zeus Confidence: ${divineData.zeus_confidence || 'N/A'}`);
            console.log(`   🦉 Athena Features: ${divineData.athena_features || 'N/A'}`);
            console.log(`   ☀️ Apollo Classification: ${divineData.apollo_classification || 'N/A'}`);
        } else {
            console.log(`❌ Divine Analysis failed: ${divineResponse.status}`);
        }
    } catch (error) {
        console.log(`❌ Divine Analysis error: ${error.message}`);
    }

    // Test 4: Storage System
    console.log('\n4️⃣ Testing Storage System...');
    try {
        const storeResponse = await fetch(`${BASE_URL}/analysis/store`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                coordinates: { lat: 5.8663, lng: -55.1668 },
                analysis_results: {
                    confidence: 0.95,
                    features_detected: 5,
                    analysis_type: 'test'
                },
                timestamp: new Date().toISOString()
            })
        });

        if (storeResponse.ok) {
            const storeData = await storeResponse.json();
            console.log('✅ Storage System Working');
            console.log(`   💾 Stored ID: ${storeData.analysis_id || 'N/A'}`);
            console.log(`   📁 Status: ${storeData.status || 'N/A'}`);
        } else {
            console.log(`❌ Storage failed: ${storeResponse.status}`);
        }
    } catch (error) {
        console.log(`❌ Storage error: ${error.message}`);
    }

    console.log('\n🏁 ANALYSIS TESTING COMPLETE');
    console.log('==============================');
}

function checkIfRealAnalysis(data) {
    // Check for signs of real analysis vs hardcoded responses
    const realAnalysisIndicators = [
        data.analysis_id && data.analysis_id !== 'hardcoded',
        data.timestamp && new Date(data.timestamp).getTime() > Date.now() - 60000, // Recent timestamp
        data.coordinates && typeof data.coordinates === 'object',
        data.processing_time && data.processing_time > 0,
        !data.message || !data.message.includes('fallback')
    ];

    return realAnalysisIndicators.filter(Boolean).length >= 3;
}

// Run the tests
testRealAnalysis().catch(console.error); 