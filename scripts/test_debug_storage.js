#!/usr/bin/env node

const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function debugStorage() {
    console.log('🔍 Debugging storage response...');
    
    const storageData = {
        analysis_id: `divine_debug_${Date.now()}`,
        coordinates: { lat: -3.4653, lng: -62.2159 },
        analysis_type: 'divine',
        confidence: 0.797,
        features_detected: 0,
        detected_features: [],
        cultural_assessment: {},
        site_id: 'site_amazon_fd7091',
        site_name: 'Amazon Settlement Platform',
        timestamp: new Date().toISOString(),
        archaeologically_significant: true,
        analysis_depth: 'divine',
        agent_performance: {},
        pattern_type: 'Ceremonial Complex',
        description: 'Archaeological analysis reveals significant cultural features',
        cultural_indicators: [],
        historical_context: 'Pre-Columbian settlement activity'
    };

    try {
        // Write storage data to temp file
        const storageFile = `debug_storage_${Date.now()}.json`;
        fs.writeFileSync(storageFile, JSON.stringify(storageData, null, 2));
        
        console.log('📝 Storage data written to:', storageFile);
        console.log('📦 Storage data:', JSON.stringify(storageData, null, 2));
        
        const curlCommand = `curl -s -X POST "http://localhost:8004/storage/save" ` +
            `-H "Content-Type: application/json" ` +
            `-d @${storageFile}`;

        console.log('🚀 Executing command:', curlCommand);
        
        const { stdout } = await execAsync(curlCommand);
        
        console.log('📨 Raw response:', stdout);
        console.log('📨 Response length:', stdout.length);
        
        // Cleanup temp file
        try {
            fs.unlinkSync(storageFile);
        } catch {}
        
        const storageResult = JSON.parse(stdout);
        console.log('🎯 Parsed response:', JSON.stringify(storageResult, null, 2));
        
        console.log('✅ Success:', storageResult.success);
        console.log('📋 Storage reason:', storageResult.storage_reason);
        console.log('💬 Message:', storageResult.message);
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
        console.error('📍 Error details:', error);
    }
}

debugStorage(); 