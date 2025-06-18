#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Quick System Health Check${NC}\n"

# Check Docker
echo -e "${YELLOW}🐳 Checking Docker...${NC}"
if docker info >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker daemon is running${NC}"
    
    # Check Redis container
    if docker ps | grep -q nis-redis-simple; then
        echo -e "${GREEN}✅ Redis container is running${NC}"
    else
        echo -e "${RED}❌ Redis container is not running${NC}"
    fi
    
    # Check Zookeeper container
    if docker ps | grep -q nis-zookeeper; then
        echo -e "${GREEN}✅ Zookeeper container is running${NC}"
    else
        echo -e "${RED}❌ Zookeeper container is not running${NC}"
    fi
    
    # Check Kafka container
    if docker ps | grep -q nis-kafka; then
        echo -e "${GREEN}✅ Kafka container is running${NC}"
    else
        echo -e "${RED}❌ Kafka container is not running${NC}"
    fi
else
    echo -e "${RED}❌ Docker daemon is not running${NC}"
fi

# Check Backend
echo -e "\n${YELLOW}🖥️  Checking Backend...${NC}"
if curl -s --connect-timeout 5 http://localhost:8000/system/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is responding on port 8000${NC}"
    
    # Get backend status
    backend_status=$(curl -s http://localhost:8000/system/health 2>/dev/null | head -c 100)
    if [ ! -z "$backend_status" ]; then
        echo -e "${BLUE}   Status: $backend_status${NC}"
    fi
else
    echo -e "${RED}❌ Backend is not responding on port 8000${NC}"
fi

# Check Frontend
echo -e "\n${YELLOW}🌐 Checking Frontend...${NC}"
if curl -s --connect-timeout 5 http://localhost:3000 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is responding on port 3000${NC}"
else
    echo -e "${RED}❌ Frontend is not responding on port 3000${NC}"
fi

# Check processes
echo -e "\n${YELLOW}🔄 Checking Processes...${NC}"
if pgrep -f "python run_api.py\|python simple_backend.py" >/dev/null; then
    backend_pid=$(pgrep -f "python run_api.py\|python simple_backend.py")
    echo -e "${GREEN}✅ Backend process running (PID: $backend_pid)${NC}"
else
    echo -e "${RED}❌ Backend process not found${NC}"
fi

if pgrep -f "next dev" >/dev/null; then
    frontend_pid=$(pgrep -f "next dev")
    echo -e "${GREEN}✅ Frontend process running (PID: $frontend_pid)${NC}"
else
    echo -e "${RED}❌ Frontend process not found${NC}"
fi

echo -e "\n${BLUE}📋 Summary:${NC}"
echo -e "   Backend:  ${GREEN}http://localhost:8000${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "   API Docs: ${GREEN}http://localhost:8000/docs${NC}"

echo -e "\n${YELLOW}💡 If any service is not running, try:${NC}"
echo -e "   ${CYAN}./reset_nis_system.sh${NC} - for development mode"
echo -e "   ${CYAN}./start.sh${NC} - for Docker Compose mode" 