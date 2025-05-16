#!/bin/bash

# Start script for the NIS Protocol project

# Create necessary directories
mkdir -p data/lidar
mkdir -p data/satellite
mkdir -p data/colonial_texts
mkdir -p data/overlays
mkdir -p outputs/findings
mkdir -p outputs/logs
mkdir -p outputs/memory

# Ensure the script is executable
chmod +x run_api.py

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Start the API server
echo "Starting NIS Protocol API server..."
python run_api.py 