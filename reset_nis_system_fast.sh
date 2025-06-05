#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Fast NIS System Reset${NC}"
echo -e "${YELLOW}⚡ Optimized for speed and reliability${NC}"

# Stop any running processes
echo -e "${YELLOW}📛 Stopping existing processes...${NC}"
pkill -f "python.*backend" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "uvicorn" 2>/dev/null || true
pkill -f "mock_ikrp" 2>/dev/null || true

# Quick cache cleanup - use aggressive but safe methods
echo -e "${YELLOW}🧹 Quick cache cleanup...${NC}"

# Remove Next.js cache quickly
if [ -d "frontend/.next" ]; then
    echo -e "${BLUE}   🗑️  Removing Next.js cache...${NC}"
    rm -rf frontend/.next 2>/dev/null &
fi

# Remove problematic pnpm cache quickly
if [ -d "frontend/node_modules/.pnpm" ]; then
    echo -e "${BLUE}   🗑️  Removing pnpm cache...${NC}"
    # Use parallel removal for speed
    (cd frontend/node_modules && rm -rf .pnpm) 2>/dev/null &
fi

# Remove other caches
if [ -d "frontend/node_modules/.cache" ]; then
    echo -e "${BLUE}   🗑️  Removing general cache...${NC}"
    rm -rf frontend/node_modules/.cache 2>/dev/null &
fi

# Wait for background cache cleanup (max 10 seconds)
echo -e "${BLUE}⏳ Waiting for cache cleanup to complete...${NC}"
sleep 3

# Kill any remaining cleanup processes to prevent hanging
cleanup_pids=$(jobs -p)
if [ ! -z "$cleanup_pids" ]; then
    wait $cleanup_pids 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Cache cleanup taking too long, forcing completion...${NC}"
        kill $cleanup_pids 2>/dev/null || true
    }
fi

echo -e "${GREEN}✅ Cache cleanup completed${NC}"

# Quick dependency check/fix
echo -e "${YELLOW}📦 Checking dependencies...${NC}"
cd frontend

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found${NC}"
    cd ..
    exit 1
fi

# Only reinstall if node_modules is corrupted
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo -e "${BLUE}📦 Reinstalling dependencies...${NC}"
    
    # Remove lock files for clean install
    rm -f package-lock.json pnpm-lock.yaml 2>/dev/null || true
    
    # Try npm first (usually faster and more reliable)
    if timeout 180 npm install --force --silent; then
        echo -e "${GREEN}✅ Dependencies installed with npm${NC}"
    elif command -v pnpm &> /dev/null && timeout 120 pnpm install --force --silent; then
        echo -e "${GREEN}✅ Dependencies installed with pnpm${NC}"
    else
        echo -e "${YELLOW}⚠️  Using existing dependencies${NC}"
    fi
else
    echo -e "${GREEN}✅ Dependencies look good, skipping reinstall${NC}"
fi

cd ..

# Start services
echo -e "${GREEN}🚀 Starting services...${NC}"

# Start mock IKRP service
echo -e "${BLUE}📜 Starting mock IKRP service...${NC}"
python mock_ikrp_service.py &
IKRP_PID=$!

# Start main backend
echo -e "${BLUE}🔧 Starting main backend...${NC}"
python backend_main.py &
BACKEND_PID=$!

# Wait for backends to start
echo -e "${BLUE}⏳ Waiting for backends (10s)...${NC}"
sleep 10

# Start frontend
echo -e "${BLUE}🎨 Starting frontend...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Quick health check
echo -e "${BLUE}🔍 Quick health check...${NC}"
sleep 5

# Check services
backend_ok=false
ikrp_ok=false
frontend_ok=false

if curl -s http://localhost:8000/system/health > /dev/null 2>&1; then
    backend_ok=true
fi

if curl -s http://localhost:8001/ > /dev/null 2>&1; then
    ikrp_ok=true
fi

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    frontend_ok=true
fi

echo ""
echo -e "${GREEN}🎉 Fast Reset Complete!${NC}"
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
if [ "$backend_ok" = true ]; then
    echo -e "   Backend (8000):  ${GREEN}✅ ONLINE${NC}"
else
    echo -e "   Backend (8000):  ${YELLOW}⏳ Starting...${NC}"
fi

if [ "$ikrp_ok" = true ]; then
    echo -e "   IKRP (8001):     ${GREEN}✅ ONLINE${NC}"
else
    echo -e "   IKRP (8001):     ${YELLOW}⏳ Starting...${NC}"
fi

if [ "$frontend_ok" = true ]; then
    echo -e "   Frontend (3000): ${GREEN}✅ ONLINE${NC}"
else
    echo -e "   Frontend (3000): ${YELLOW}⏳ Starting...${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Process IDs:${NC}"
echo -e "   Backend PID:  ${YELLOW}$BACKEND_PID${NC}"
echo -e "   IKRP PID:     ${YELLOW}$IKRP_PID${NC}"
echo -e "   Frontend PID: ${YELLOW}$FRONTEND_PID${NC}"
echo ""
echo -e "${BLUE}📝 To stop all services:${NC}"
echo -e "   ${YELLOW}kill $BACKEND_PID $IKRP_PID $FRONTEND_PID${NC}"
echo ""
echo -e "${GREEN}🌐 Access URLs:${NC}"
echo -e "   ${BLUE}Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "   ${BLUE}Backend:  ${GREEN}http://localhost:8000/docs${NC}"
echo -e "   ${BLUE}IKRP:     ${GREEN}http://localhost:8001${NC}"
echo "" 