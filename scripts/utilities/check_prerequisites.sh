#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔍 NIS Protocol - Prerequisites Checker${NC}"
echo -e "${BLUE}Verifying system requirements for judges...${NC}"
echo ""

# Track overall status
ALL_GOOD=true

# Check Docker
echo -e "${BLUE}📦 Checking Docker...${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "   ${GREEN}✅ Docker found: $DOCKER_VERSION${NC}"
    
    # Check if Docker daemon is running
    if docker info >/dev/null 2>&1; then
        echo -e "   ${GREEN}✅ Docker daemon is running${NC}"
    else
        echo -e "   ${RED}❌ Docker daemon is not running${NC}"
        echo -e "   ${YELLOW}   Please start Docker Desktop${NC}"
        ALL_GOOD=false
    fi
else
    echo -e "   ${RED}❌ Docker not found${NC}"
    echo -e "   ${YELLOW}   Please install Docker Desktop${NC}"
    ALL_GOOD=false
fi

# Check Docker Compose
echo -e "${BLUE}🐙 Checking Docker Compose...${NC}"
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo -e "   ${GREEN}✅ Docker Compose found: $COMPOSE_VERSION${NC}"
elif docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version)
    echo -e "   ${GREEN}✅ Docker Compose (v2) found: $COMPOSE_VERSION${NC}"
else
    echo -e "   ${RED}❌ Docker Compose not found${NC}"
    echo -e "   ${YELLOW}   Please install Docker Compose${NC}"
    ALL_GOOD=false
fi

# Check Git
echo -e "${BLUE}📚 Checking Git...${NC}"
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo -e "   ${GREEN}✅ Git found: $GIT_VERSION${NC}"
else
    echo -e "   ${RED}❌ Git not found${NC}"
    echo -e "   ${YELLOW}   Please install Git${NC}"
    ALL_GOOD=false
fi

# Check memory
echo -e "${BLUE}💾 Checking System Memory...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    TOTAL_MEM=$(sysctl -n hw.memsize | awk '{print int($1/1024/1024/1024)}')
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    TOTAL_MEM=$(free -g | awk '/^Mem:/ {print $2}')
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    # Windows (Git Bash) - simplified approach
    TOTAL_MEM=$(wmic computersystem get TotalPhysicalMemory /format:value 2>/dev/null | grep "TotalPhysicalMemory=" | cut -d"=" -f2 | awk '{print int($1/1024/1024/1024)}' 2>/dev/null || echo "8")
else
    TOTAL_MEM="8"
fi

if [[ "$TOTAL_MEM" != "Unknown" ]] && [[ "$TOTAL_MEM" -ge 8 ]]; then
    echo -e "   ${GREEN}✅ Memory: ${TOTAL_MEM}GB (Sufficient)${NC}"
elif [[ "$TOTAL_MEM" != "Unknown" ]] && [[ "$TOTAL_MEM" -ge 4 ]]; then
    echo -e "   ${YELLOW}⚠️  Memory: ${TOTAL_MEM}GB (Minimum - may be slow)${NC}"
else
    echo -e "   ${YELLOW}⚠️  Memory: ${TOTAL_MEM}GB (Could not determine or low)${NC}"
fi

# Check disk space
echo -e "${BLUE}💽 Checking Disk Space...${NC}"
AVAILABLE_SPACE=$(df -h . | awk 'NR==2 {print $4}')
echo -e "   ${GREEN}✅ Available space: $AVAILABLE_SPACE${NC}"

# Check ports
echo -e "${BLUE}🔌 Checking Port Availability...${NC}"
PORTS=(3000 8000 8001 8003 6379 9092 2181)
PORTS_IN_USE=()

for port in "${PORTS[@]}"; do
    if netstat -ano | grep ":$port " >/dev/null 2>&1; then
        PORTS_IN_USE+=($port)
    fi
done

if [ ${#PORTS_IN_USE[@]} -eq 0 ]; then
    echo -e "   ${GREEN}✅ All required ports are available${NC}"
else
    echo -e "   ${YELLOW}⚠️  Ports in use: ${PORTS_IN_USE[*]}${NC}"
    echo -e "   ${BLUE}   (The startup script will handle port conflicts)${NC}"
fi

# Check internet connectivity
echo -e "${BLUE}🌐 Checking Internet Connectivity...${NC}"
if ping -c 1 8.8.8.8 >/dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Internet connection available${NC}"
else
    echo -e "   ${YELLOW}⚠️  Internet connection may be limited${NC}"
    echo -e "   ${BLUE}   (Required for Docker image downloads)${NC}"
fi

# Final verdict
echo ""
echo -e "${CYAN}📋 Prerequisites Summary:${NC}"
echo ""

if [ "$ALL_GOOD" = true ]; then
    echo -e "${GREEN}🎉 All prerequisites met! System is ready for NIS Protocol.${NC}"
    echo ""
    echo -e "${BLUE}🚀 Ready to launch? Run:${NC}"
    echo -e "   ${YELLOW}./start.sh${NC}     (Linux/Mac)"
    echo -e "   ${YELLOW}start.bat${NC}      (Windows)"
    echo ""
    echo -e "${GREEN}Expected startup time: 2-5 minutes${NC}"
else
    echo -e "${RED}❌ Some prerequisites are missing.${NC}"
    echo ""
    echo -e "${YELLOW}📋 Installation Guide:${NC}"
    echo -e "   ${BLUE}Docker Desktop:${NC} https://www.docker.com/products/docker-desktop/"
    echo -e "   ${BLUE}Git:${NC}            https://git-scm.com/downloads"
    echo ""
    echo -e "${BLUE}After installation, restart your terminal and run this script again.${NC}"
fi

echo ""
echo -e "${CYAN}🏛️ NIS Protocol - Archaeological Discovery Platform${NC}"
echo -e "${BLUE}   Powered by Organica AI Solutions${NC}" 