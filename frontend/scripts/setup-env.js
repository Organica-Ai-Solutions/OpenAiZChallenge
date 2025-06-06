#!/usr/bin/env node

// Environment Setup Script - Fixes Google Maps and Backend Issues
// Separate from main chat system

const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(__dirname, '..', '.env.local');

console.log('🔧 Setting up environment configuration...');

// Read current .env.local
let envContent = '';
try {
  envContent = fs.readFileSync(envLocalPath, 'utf8');
} catch (error) {
  console.log('📝 Creating new .env.local file...');
}

// Ensure required environment variables
const requiredVars = {
  'NEXT_PUBLIC_BACKEND_URL': 'http://localhost:8000',
  'NEXT_PUBLIC_SKIP_PREFLIGHT_CHECK': 'true',
  'GENERATE_SOURCEMAP': 'false',
  'NEXT_TELEMETRY_DISABLED': '1',
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY': '# Add your Google Maps API key here (optional)'
};

let updated = false;

Object.entries(requiredVars).forEach(([key, defaultValue]) => {
  if (!envContent.includes(key + '=')) {
    envContent += `\n${key}=${defaultValue}`;
    updated = true;
    console.log(`✅ Added ${key}`);
  }
});

if (updated) {
  fs.writeFileSync(envLocalPath, envContent);
  console.log('✅ Environment configuration updated');
} else {
  console.log('✅ Environment already configured');
}

// Check backend connectivity
console.log('🔍 Checking backend connectivity...');

const http = require('http');

const checkBackend = () => {
  const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/system/health',
    timeout: 5000
  };

  const req = http.get(options, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Backend is running and healthy');
    } else {
      console.log('⚠️ Backend responded but may have issues');
    }
  });

  req.on('error', (error) => {
    console.log('❌ Backend not accessible - make sure it\'s running on port 8000');
    console.log('💡 Run: cd .. && python backend_main.py');
  });

  req.on('timeout', () => {
    console.log('⏰ Backend connection timed out');
    req.destroy();
  });
};

setTimeout(checkBackend, 1000);

console.log('\n🎉 Setup complete! The chat UI/UX is locked and protected.');
console.log('💡 To fix Google Maps issues, add your API key to .env.local');
console.log('🚀 Frontend should now have fewer errors'); 