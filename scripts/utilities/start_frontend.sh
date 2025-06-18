#!/bin/bash

echo "🌍 Starting Archaeological Discovery System (Mac/Linux)..."

# Load environment variables from .env file
if [ -f .env ]; then
    echo "Loading environment variables..."
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
fi

# Display Google Maps API key status
if [ -n "$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" ]; then
    echo "✅ Google Maps API Key loaded: ${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:0:20}..."
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
