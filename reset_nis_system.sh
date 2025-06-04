#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Resetting NIS System...${NC}"

# Function to check if Docker is available
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${YELLOW}⚠️  Docker not found. Skipping Docker-related cleanup.${NC}"
        return 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Docker daemon not running. Skipping Docker-related cleanup.${NC}"
        return 1
    fi
    
    return 0
}

# Stop any running processes
echo -e "${YELLOW}📛 Stopping existing processes...${NC}"
pkill -f "python run_api.py" 2>/dev/null || true
pkill -f "python simple_backend.py" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "uvicorn" 2>/dev/null || true

# Stop and remove existing Docker containers (only if Docker is available)
if check_docker; then
    echo -e "${YELLOW}🐳 Cleaning up Docker containers...${NC}"
    docker stop nis-redis-simple 2>/dev/null || true
    docker rm nis-redis-simple 2>/dev/null || true
    docker stop nis-kafka 2>/dev/null || true
    docker rm nis-kafka 2>/dev/null || true
    docker stop nis-zookeeper 2>/dev/null || true
    docker rm nis-zookeeper 2>/dev/null || true
    
    # Clean up any other NIS containers
    docker ps -a | grep nis | awk '{print $1}' | xargs -r docker rm -f 2>/dev/null || true
else
    echo -e "${YELLOW}🐳 Skipping Docker cleanup (Docker not available)${NC}"
fi

# Clear Next.js cache and fix corrupted node_modules
echo -e "${YELLOW}🧹 Clearing frontend cache and fixing dependencies...${NC}"
if [ -d "frontend/.next" ]; then
    rm -rf frontend/.next
fi

if [ -d "frontend/node_modules/.cache" ]; then
    rm -rf frontend/node_modules/.cache
fi

# Fix corrupted pnpm/npm cache that's causing the JSON parsing error
if [ -d "frontend/node_modules/.pnpm" ]; then
    echo -e "${YELLOW}🔧 Fixing corrupted pnpm cache...${NC}"
    rm -rf frontend/node_modules/.pnpm
fi

# Clear npm/yarn cache if they exist
if [ -d "frontend/node_modules/.yarn-integrity" ]; then
    rm -f frontend/node_modules/.yarn-integrity
fi

# Reinstall frontend dependencies to fix corruption
echo -e "${YELLOW}📦 Reinstalling frontend dependencies...${NC}"
cd frontend
if command -v pnpm &> /dev/null; then
    pnpm install --force
elif command -v npm &> /dev/null; then
    npm install --force
else
    echo -e "${RED}❌ No package manager found (npm/pnpm). Please install Node.js.${NC}"
fi
cd ..

# Clear Python cache
echo -e "${YELLOW}🧹 Clearing Python cache...${NC}"
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true

# Clear logs
echo -e "${YELLOW}🧹 Clearing logs...${NC}"
if [ -d "outputs/logs" ]; then
    rm -rf outputs/logs/*
fi
if [ -d "logs" ]; then
    rm -rf logs/*
fi

# Start services
if check_docker; then
    # Start Redis
    echo -e "${GREEN}🚀 Starting Redis...${NC}"
    docker run -d --name nis-redis-simple -p 6379:6379 redis:7-alpine
    
    # Wait for Redis to start
    echo -e "${BLUE}⏳ Waiting for Redis to start...${NC}"
    sleep 3
else
    echo -e "${YELLOW}⚠️  Skipping Redis startup (Docker not available)${NC}"
fi

# Start backend
echo -e "${GREEN}🚀 Starting backend...${NC}"
export REDIS_HOST=localhost
cd "$(dirname "$0")"

# Activate virtual environment if it exists
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    echo -e "${GREEN}✅ Virtual environment activated${NC}"
else
    echo -e "${YELLOW}⚠️  Virtual environment not found. Using system Python.${NC}"
fi

python simple_backend.py &
BACKEND_PID=$!

# Wait for backend to start
echo -e "${BLUE}⏳ Waiting for backend to start...${NC}"
sleep 5

# Test backend health with timeout and retries
echo -e "${BLUE}🔍 Testing backend health...${NC}"
backend_ready=false
for i in {1..6}; do
    if timeout 5 curl -s http://localhost:8000/system/health > /dev/null; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
        backend_ready=true
        break
    else
        echo -e "${YELLOW}⏳ Backend not ready yet, attempt $i/6...${NC}"
        sleep 5
    fi
done

if [ "$backend_ready" = false ]; then
    echo -e "${YELLOW}⚠️  Backend health check failed or timed out after 30 seconds${NC}"
    echo -e "${BLUE}💡 Backend may still be starting up. Check http://localhost:8000/docs manually${NC}"
fi

# Start frontend
echo -e "${GREEN}🚀 Starting frontend...${NC}"
cd frontend

# Use the correct port (3000 to match docker-compose.yml)
export PORT=3000
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo -e "${BLUE}⏳ Waiting for frontend to start...${NC}"
sleep 10

# Test frontend with timeout
echo -e "${BLUE}🔍 Testing frontend...${NC}"
if timeout 10 curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend health check failed or timed out${NC}"
fi

cd ..

echo ""
echo -e "${GREEN}🎉 NIS System Reset Complete!${NC}"
echo ""
echo -e "${BLUE}📊 System Status:${NC}"
echo -e "   Backend:  ${GREEN}http://localhost:8000${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
if check_docker; then
    echo -e "   Redis:    ${GREEN}localhost:6379${NC}"
else
    echo -e "   Redis:    ${YELLOW}Not started (Docker unavailable)${NC}"
fi
echo ""
echo -e "${BLUE}🔧 Process IDs:${NC}"
echo -e "   Backend PID:  ${YELLOW}$BACKEND_PID${NC}"
echo -e "   Frontend PID: ${YELLOW}$FRONTEND_PID${NC}"
echo ""
echo -e "${BLUE}📝 To stop the system:${NC}"
echo -e "   ${YELLOW}kill $BACKEND_PID $FRONTEND_PID${NC}"
if check_docker; then
    echo -e "   ${YELLOW}docker stop nis-redis-simple${NC}"
fi
echo "" 