#!/usr/bin/env node

// Test codex endpoints specifically on port 8001
async function testCodexEndpoints() {
    console.log('📚 Testing IKRP Codex Reader Endpoints...');
    console.log('=' * 50);
    
    const baseUrl = 'http://localhost:8001';
    const endpoints = [
        { path: '/codex/sources', method: 'GET' },
        { path: '/codex/discover', method: 'POST', data: {
            query: 'archaeological sites Amazon',
            max_results: 5,
            relevance_threshold: 0.5
        }},
        { path: '/system/health', method: 'GET' },
        { path: '/', method: 'GET' }
    ];
    
    for (const endpoint of endpoints) {
        const url = `${baseUrl}${endpoint.path}`;
        console.log(`\nTesting ${endpoint.method} ${url}`);
        
        try {
            let response;
            if (endpoint.method === 'POST') {
                response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(endpoint.data)
                });
            } else {
                response = await fetch(url);
            }
            
            console.log(`  Status: ${response.status} ${response.statusText}`);
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                console.log(`  Response: ${JSON.stringify(data).substring(0, 100)}...`);
                
                // Special handling for different endpoints
                if (endpoint.path === '/codex/sources' && data.sources) {
                    console.log(`  📚 Found ${data.sources.length} codex sources`);
                } else if (endpoint.path === '/codex/discover' && data.codices) {
                    console.log(`  🔍 Found ${data.codices.length} codices`);
                    if (data.codices.length > 0) {
                        console.log(`  📖 Top result: ${data.codices[0].title}`);
                    }
                } else if (endpoint.path === '/system/health') {
                    console.log(`  🏥 IKRP Status: ${data.status || 'Running'}`);
                }
            } else {
                const text = await response.text();
                console.log(`  Response: ${text.substring(0, 100)}...`);
            }
            
            if (response.ok) {
                console.log('  ✅ Success');
            } else {
                console.log('  ⚠️  Non-200 status');
            }
            
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
        }
    }
}

// Handle Node.js versions that don't have fetch
if (typeof fetch === 'undefined') {
    console.log('Installing node-fetch for compatibility...');
    try {
        const fetch = require('node-fetch');
        global.fetch = fetch;
    } catch (e) {
        console.log('⚠️  fetch not available. Run: npm install node-fetch');
        process.exit(1);
    }
}

testCodexEndpoints().catch(console.error); 