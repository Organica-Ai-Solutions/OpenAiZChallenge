#!/bin/bash

# NIS Protocol Fallback Backend Startup Script
# This script starts the fallback backend

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
RESET='\033[0m'

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}🚀 Starting NIS Protocol Fallback Backend...${RESET}"

# Check if Python virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${RED}❌ Virtual environment not found. Please run setup first.${RESET}"
    echo -e "${YELLOW}Run: python -m venv venv && source venv/bin/activate && pip install -r requirements.txt${RESET}"
    exit 1
fi

# Check if fallback_backend.py exists
if [ ! -f "fallback_backend.py" ]; then
    echo -e "${RED}❌ fallback_backend.py not found.${RESET}"
    exit 1
fi

# Activate virtual environment
echo -e "${BLUE}📦 Activating virtual environment...${RESET}"
source venv/bin/activate

# Check if dependencies are installed
echo -e "${BLUE}🔍 Checking dependencies...${RESET}"
if ! python -c "import json, logging, time, random, math, datetime, typing, http.server, urllib.parse" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Installing missing dependencies...${RESET}"
    pip install -r requirements.txt
fi

# Start the fallback backend
echo -e "${GREEN}🛡️  Starting NIS Protocol Fallback Backend on port 8003...${RESET}"
echo -e "${BLUE}📡 LIDAR processing enabled${RESET}"
echo -e "${BLUE}🔬 Real IKRP integration active${RESET}"
echo -e "${YELLOW}💡 This serves as a reliable fallback when Docker services are unavailable${RESET}"
echo -e ""
echo -e "${GREEN}Access the fallback backend at: http://localhost:8003${RESET}"
echo -e "${GREEN}Health check: http://localhost:8003/system/health${RESET}"
echo -e ""
echo -e "${YELLOW}Press Ctrl+C to stop the fallback backend${RESET}"
echo -e ""

# Run the fallback backend
python fallback_backend.py 