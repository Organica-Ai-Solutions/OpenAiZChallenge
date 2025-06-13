#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Cross-platform environment setup
const isWindows = os.platform() === 'win32';
const isMac = os.platform() === 'darwin';
const isLinux = os.platform() === 'linux';

console.log(`🌍 Setting up cross-platform compatibility for ${os.platform()}...`);

// Test backend endpoints using Node.js fetch
async function testBackendEndpoints() {
    console.log('\n🧪 Testing Backend Endpoints...');
    console.log('=' * 50);
    
    const endpoints = [
        'http://localhost:8000/system/health',
        'http://localhost:8000/research/sites',
        'http://localhost:8000/research/discoveries',
        'http://localhost:8000/codex/analyze',
        'http://localhost:8000/ikrp/status'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            console.log(`✅ ${endpoint}: ${response.status} - ${response.statusText}`);
            
            // Special handling for codex endpoint
            if (endpoint.includes('/codex/')) {
                console.log(`   📚 Codex Reader Status: ${data.status || 'Available'}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint}: ${error.message}`);
        }
    }
}

// Create cross-platform startup scripts
function createStartupScripts() {
    console.log('\n🔧 Creating Cross-Platform Scripts...');
    
    // Windows batch file
    const windowsBatch = `@echo off
echo 🌍 Starting Archaeological Discovery System (Windows)...

REM Load environment variables
if exist .env (
    echo Loading environment variables...
    for /f "tokens=1,2 delims==" %%a in ('type .env ^| findstr /v "^#" ^| findstr /v "^$"') do set %%a=%%b
)

REM Display Google Maps API key status
if defined NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (
    echo ✅ Google Maps API Key loaded
) else (
    echo ⚠️  Google Maps API Key not found - using fallback map
)

echo Starting frontend development server...
cd frontend
npm run dev
`;

    // Mac/Linux shell script
    const macLinuxScript = `#!/bin/bash

echo "🌍 Starting Archaeological Discovery System (Mac/Linux)..."

# Load environment variables from .env file
if [ -f .env ]; then
    echo "Loading environment variables..."
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
fi

# Display Google Maps API key status
if [ -n "$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" ]; then
    echo "✅ Google Maps API Key loaded: \${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:0:20}..."
else
    echo "⚠️  Google Maps API Key not found - using fallback map"
fi

echo "Starting frontend development server..."
cd frontend

# Use npm or yarn based on what's available
if command -v yarn &> /dev/null; then
    echo "Using Yarn..."
    yarn dev
elif command -v npm &> /dev/null; then
    echo "Using npm..."
    npm run dev
else
    echo "❌ Neither npm nor yarn found. Please install Node.js and npm/yarn."
    exit 1
fi
`;

    // Write platform-specific scripts
    fs.writeFileSync('start_frontend.bat', windowsBatch);
    fs.writeFileSync('start_frontend.sh', macLinuxScript);
    
    // Make shell script executable on Unix systems
    if (!isWindows) {
        try {
            fs.chmodSync('start_frontend.sh', '755');
        } catch (e) {
            console.log('Note: Could not make shell script executable. Run: chmod +x start_frontend.sh');
        }
    }
    
    console.log('✅ Created start_frontend.bat (Windows)');
    console.log('✅ Created start_frontend.sh (Mac/Linux)');
}

// Create cross-platform package.json scripts
function updatePackageJsonScripts() {
    const packageJsonPath = path.join('frontend', 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            
            // Add cross-platform scripts
            packageJson.scripts = {
                ...packageJson.scripts,
                'dev:mac': 'cd .. && ./start_frontend.sh',
                'dev:windows': 'cd .. && start_frontend.bat',
                'dev:cross-platform': isWindows ? 'npm run dev:windows' : 'npm run dev:mac',
                'test:backend': 'node ../test_backend.js',
                'setup:env': 'node ../setup_cross_platform.js'
            };
            
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            console.log('✅ Updated frontend/package.json with cross-platform scripts');
        } catch (error) {
            console.log('⚠️  Could not update package.json scripts:', error.message);
        }
    }
}

// Create environment variable helper
function createEnvHelper() {
    const envHelper = `#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath = '.env') {
    if (!fs.existsSync(filePath)) {
        console.log('⚠️  .env file not found. Creating example...');
        return false;
    }
    
    const envContent = fs.readFileSync(filePath, 'utf8');
    const lines = envContent.split('\\n');
    
    console.log('🔑 Environment Variables Status:');
    console.log('=' * 40);
    
    const envVars = {};
    
    lines.forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
            const [key, value] = line.split('=');
            if (key && value) {
                envVars[key.trim()] = value.trim();
                
                if (key.includes('GOOGLE_MAPS')) {
                    console.log(\`✅ \${key}: \${value.substring(0, 10)}...\`);
                } else if (key.includes('API_KEY') || key.includes('TOKEN')) {
                    console.log(\`✅ \${key}: [REDACTED]\`);
                } else {
                    console.log(\`✅ \${key}: \${value}\`);
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
`;

    fs.writeFileSync('check_env.js', envHelper);
    console.log('✅ Created check_env.js helper');
}

// Main setup function
async function main() {
    console.log('🚀 Archaeological Discovery System - Cross-Platform Setup');
    console.log('Platform:', os.platform(), os.arch());
    console.log('Node.js:', process.version);
    console.log('');
    
    // Test backend first
    try {
        await testBackendEndpoints();
    } catch (error) {
        console.log('⚠️  Backend testing failed:', error.message);
    }
    
    // Create cross-platform scripts
    createStartupScripts();
    updatePackageJsonScripts();
    createEnvHelper();
    
    console.log('\n🎉 Cross-Platform setup complete!');
    console.log('\n📋 Usage Instructions:');
    console.log('Windows: run start_frontend.bat');
    console.log('Mac/Linux: run ./start_frontend.sh');
    console.log('Or from frontend directory: npm run dev:cross-platform');
    console.log('\n🔍 Check environment: node check_env.js');
}

// Handle Node.js versions that don't have fetch
if (typeof fetch === 'undefined') {
    console.log('⚠️  fetch not available in this Node.js version. Skipping backend tests.');
    // Skip backend testing for older Node.js versions
    global.fetch = () => Promise.reject(new Error('fetch not available'));
}

main().catch(console.error); 