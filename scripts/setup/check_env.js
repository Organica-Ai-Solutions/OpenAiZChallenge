#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath = '.env') {
    if (!fs.existsSync(filePath)) {
        console.log('⚠️  .env file not found. Creating example...');
        return false;
    }
    
    const envContent = fs.readFileSync(filePath, 'utf8');
    const lines = envContent.split('\n');
    
    console.log('🔑 Environment Variables Status:');
    console.log('=' * 40);
    
    const envVars = {};
    
    lines.forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
            const [key, value] = line.split('=');
            if (key && value) {
                envVars[key.trim()] = value.trim();
                
                if (key.includes('GOOGLE_MAPS')) {
                    console.log(`✅ ${key}: ${value.substring(0, 10)}...`);
                } else if (key.includes('API_KEY') || key.includes('TOKEN')) {
                    console.log(`✅ ${key}: [REDACTED]`);
                } else {
                    console.log(`✅ ${key}: ${value}`);
                }
            }
        }
    });
    
    return envVars;
}

// Check if running as main module
if (require.main === module) {
    console.log('🌍 Cross-Platform Environment Checker');
    loadEnvFile();
}

module.exports = { loadEnvFile };
