#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');

const execAsync = promisify(exec);

async function testSingleDivineAnalysis() {
    console.log('🧪 Testing single divine analysis...');
    
    // Test coordinates (Amazon site)
    const lat = -3.4653;
    const lng = -62.2159;
    
    try {
        // Write JSON to temp file to avoid escaping issues
        const tempFile = 'temp_divine_request.json';
        const requestData = {
            lat: lat,
            lng: lng,
            radius: 10,
            analysis_type: "divine"
        };
        
        fs.writeFileSync(tempFile, JSON.stringify(requestData));
        
        console.log(`📍 Testing coordinates: ${lat}, ${lng}`);
        console.log('🔮 Running divine analysis...');
        
        // Use curl with file input to avoid escaping issues
        const curlCommand = `curl -s -X POST "http://localhost:8003/analyze/divine" -H "Content-Type: application/json" -d @${tempFile}`;
        
        const { stdout } = await execAsync(curlCommand);
        const analysisResult = JSON.parse(stdout);
        
        console.log('✅ Divine analysis completed!');
        console.log(`🎯 Confidence: ${(analysisResult.confidence * 100).toFixed(1)}%`);
        console.log(`🔍 Features detected: ${analysisResult.features_detected || 0}`);
        
        // Now test storage
        console.log('💾 Testing storage...');
        
        const storageData = {
            analysis_id: analysisResult.analysis_id || `divine_test_${Date.now()}`,
            coordinates: { lat: lat, lng: lng },
            analysis_type: 'divine',
            confidence: analysisResult.confidence || 0,
            features_detected: analysisResult.features_detected || 0,
            detected_features: analysisResult.detected_features || [],
            cultural_assessment: analysisResult.cultural_assessment || {},
            site_id: 'test_site_amazon',
            site_name: 'Test Amazon Site',
            timestamp: new Date().toISOString(),
            archaeologically_significant: true,
            analysis_depth: 'divine',
            agent_performance: analysisResult.agent_performance || {}
        };
        
        const storageFile = 'temp_storage_request.json';
        fs.writeFileSync(storageFile, JSON.stringify(storageData));
        
        const storageCommand = `curl -s -X POST "http://localhost:8004/storage/save" -H "Content-Type: application/json" -d @${storageFile}`;
        
        const { stdout: storageOutput } = await execAsync(storageCommand);
        const storageResult = JSON.parse(storageOutput);
        
        if (storageResult.success) {
            console.log('✅ Storage successful!');
            console.log(`📋 Storage reason: ${storageResult.reason}`);
        } else {
            console.log('⚠️ Storage rejected:');
            console.log(`📋 Reason: ${storageResult.reason}`);
        }
        
        // Verify retrieval
        console.log('🔍 Testing retrieval...');
        
        const { stdout: statsOutput } = await execAsync('curl -s http://localhost:8004/storage/stats');
        const stats = JSON.parse(statsOutput);
        
        console.log('📊 Storage Statistics:');
        console.log(`   Total analyses: ${stats.total_analyses}`);
        console.log(`   Divine analyses: ${stats.analyses_by_type?.divine || 0}`);
        console.log(`   High confidence: ${stats.high_confidence_count}`);
        
        // Cleanup temp files
        fs.unlinkSync(tempFile);
        fs.unlinkSync(storageFile);
        
        console.log('🎉 Single test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        // Cleanup temp files on error
        try {
            fs.unlinkSync('temp_divine_request.json');
        } catch {}
        try {
            fs.unlinkSync('temp_storage_request.json');
        } catch {}
    }
}

testSingleDivineAnalysis(); 