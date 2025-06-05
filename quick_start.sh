#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Quick NIS System Start${NC}"
echo -e "${YELLOW}⚡ No cache cleanup - just start services${NC}"

# Stop any running processes
echo -e "${YELLOW}📛 Stopping existing processes...${NC}"
pkill -f "python.*backend" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "uvicorn" 2>/dev/null || true
pkill -f "mock_ikrp" 2>/dev/null || true

# Wait a moment for processes to stop
sleep 2

# Start services
echo -e "${GREEN}🚀 Starting services...${NC}"

# Start mock IKRP service
echo -e "${BLUE}📜 Starting mock IKRP service on port 8001...${NC}"
python mock_ikrp_service.py &
IKRP_PID=$!

# Start main backend
echo -e "${BLUE}🔧 Starting main backend on port 8000...${NC}"
python backend_main.py &
BACKEND_PID=$!

# Wait for backends to start
echo -e "${BLUE}⏳ Waiting for backends to start (10s)...${NC}"
sleep 10

# Start frontend
echo -e "${BLUE}🎨 Starting frontend on port 3000...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo -e "${BLUE}⏳ Waiting for frontend to start (5s)...${NC}"
sleep 5

echo ""
echo -e "${GREEN}🎉 Quick Start Complete!${NC}"
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
echo -e "${YELLOW}💡 If you need cache cleanup, delete frontend/.next manually${NC}"
echo "" 