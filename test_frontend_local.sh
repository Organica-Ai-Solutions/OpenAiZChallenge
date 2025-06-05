#!/bin/bash

echo "🧪 Testing Frontend Locally..."

cd frontend

# Clean any existing build artifacts
echo "Cleaning build artifacts..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf node_modules

# Install dependencies
echo "Installing dependencies..."
npm install

# Try to build and start
echo "Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Starting development server..."
    npm run dev
else
    echo "❌ Build failed. Trying development mode directly..."
    npm run dev
fi 