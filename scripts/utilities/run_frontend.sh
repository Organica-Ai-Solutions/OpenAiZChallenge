#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    # Use grep to filter out comments and empty lines, then export
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
fi

# Verify the Google Maps API key is loaded
echo "Google Maps API Key loaded: ${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:0:20}..."

# Start frontend development server
cd frontend && npm run dev 