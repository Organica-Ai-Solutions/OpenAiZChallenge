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

# Function to detect OS and use appropriate timeout or alternative
detect_timeout() {
    local timeout_duration="$1"
    shift
    
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows Git Bash - run with background timeout using sleep and kill
        "$@" &
        local pid=$!
        (sleep "$timeout_duration" && kill $pid 2>/dev/null) &
        local killer_pid=$!
        wait $pid 2>/dev/null
        local exit_code=$?
        kill $killer_pid 2>/dev/null
        return $exit_code
    else
        # Linux/Mac - use timeout command
        timeout "$timeout_duration" "$@"
    fi
}

# Stop any running processes
echo -e "${YELLOW}📛 Stopping existing processes...${NC}"
pkill -f "python run_api.py" 2>/dev/null || true
pkill -f "python simple_backend.py" 2>/dev/null || true
pkill -f "python fallback_backend.py" 2>/dev/null || true
pkill -f "python minimal_backend.py" 2>/dev/null || true
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
    
    # Clean up any other NIS containers including fallback backend
    docker ps -a | grep nis | awk '{print $1}' | xargs -r docker rm -f 2>/dev/null || true
    docker stop nis-fallback-backend 2>/dev/null || true
    docker rm nis-fallback-backend 2>/dev/null || true
else
    echo -e "${YELLOW}🐳 Skipping Docker cleanup (Docker not available)${NC}"
fi

# Clear Next.js cache and fix corrupted node_modules
echo -e "${YELLOW}🧹 Clearing frontend cache and fixing dependencies...${NC}"
if [ -d "frontend/.next" ]; then
    rm -rf frontend/.next 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Some .next cache files couldn't be removed. This is usually okay.${NC}"
        find frontend/.next -delete 2>/dev/null || true
    }
fi

if [ -d "frontend/node_modules/.cache" ]; then
    rm -rf frontend/node_modules/.cache 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Some cache files couldn't be removed. This is usually okay.${NC}"
        find frontend/node_modules/.cache -delete 2>/dev/null || true
    }
fi

# Fix corrupted pnpm/npm cache that's causing the JSON parsing error
if [ -d "frontend/node_modules/.pnpm" ]; then
    echo -e "${YELLOW}🔧 Fixing corrupted pnpm cache...${NC}"
    
    # Try simple removal first
    if rm -rf frontend/node_modules/.pnpm 2>/dev/null; then
        echo -e "${GREEN}✅ pnpm cache removed successfully${NC}"
    else
        echo -e "${YELLOW}⚠️ Using alternative removal method...${NC}"
        
        # Use timeout to prevent hanging on large directories
        detect_timeout 30 find frontend/node_modules/.pnpm -type f -exec rm -f {} \; 2>/dev/null || {
            echo -e "${YELLOW}⚠️ File removal timed out or failed, trying directory removal...${NC}"
        }
        
        detect_timeout 15 find frontend/node_modules/.pnpm -type d -empty -delete 2>/dev/null || {
            echo -e "${YELLOW}⚠️ Some cache directories couldn't be removed. Continuing anyway...${NC}"
        }
        
        # Final attempt - just remove what we can
        rm -rf frontend/node_modules/.pnpm 2>/dev/null || {
            echo -e "${YELLOW}⚠️ Some pnpm cache files remain. This shouldn't affect functionality.${NC}"
        }
    fi
    echo -e "${GREEN}✅ pnpm cache cleanup completed${NC}"
fi

# Clear npm/yarn cache if they exist
if [ -d "frontend/node_modules/.yarn-integrity" ]; then
    rm -f frontend/node_modules/.yarn-integrity
fi

# Reinstall frontend dependencies to fix corruption
echo -e "${YELLOW}📦 Reinstalling frontend dependencies...${NC}"
cd frontend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found in frontend directory${NC}"
    cd ..
    exit 1
fi

# Try to fix package-lock issues
echo -e "${BLUE}🔧 Cleaning lock files...${NC}"
if [ -f "package-lock.json" ]; then
    rm -f package-lock.json 2>/dev/null || true
fi

if [ -f "pnpm-lock.yaml" ]; then
    rm -f pnpm-lock.yaml 2>/dev/null || true
fi

echo -e "${BLUE}⏳ Installing dependencies (this may take a few minutes)...${NC}"

# Function to get npm command (Windows uses npm.cmd)
get_npm_cmd() {
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
        echo "npm.cmd"
    else
        echo "npm"
    fi
}

# Install dependencies with proper error handling
NPM_CMD=$(get_npm_cmd)
if command -v pnpm &> /dev/null; then
    echo -e "${BLUE}📦 Using pnpm...${NC}"
    detect_timeout 300 pnpm install --force 2>/dev/null || {
        echo -e "${YELLOW}⚠️  pnpm install failed or timed out, trying npm...${NC}"
        detect_timeout 300 $NPM_CMD install --force || {
            echo -e "${RED}❌ Both pnpm and npm failed. Continuing with existing dependencies...${NC}"
        }
    }
elif command -v $NPM_CMD &> /dev/null; then
    echo -e "${BLUE}📦 Using npm...${NC}"
    detect_timeout 300 $NPM_CMD install --force || {
        echo -e "${RED}❌ npm install failed or timed out. Continuing with existing dependencies...${NC}"
    }
else
    echo -e "${RED}❌ No package manager found (npm/pnpm). Please install Node.js.${NC}"
    cd ..
    exit 1
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

# Handle storage directory
echo -e "${YELLOW}💾 Handling archaeological storage...${NC}"
if [ -d "storage" ] && [ -n "$(ls -A storage 2>/dev/null)" ]; then
    echo -e "${BLUE}📊 Found existing archaeological discoveries in storage/...${NC}"
    
    # Count existing discoveries
    sites_count=0
    analyses_count=0
    patterns_count=0
    
    if [ -f "storage/archaeological_sites.json" ]; then
        sites_count=$(python3 -c "import json; print(len(json.load(open('storage/archaeological_sites.json', 'r'))))" 2>/dev/null || echo "0")
    fi
    
    if [ -f "storage/analysis_sessions.json" ]; then
        analyses_count=$(python3 -c "import json; print(len(json.load(open('storage/analysis_sessions.json', 'r'))))" 2>/dev/null || echo "0")
    fi
    
    if [ -f "storage/learning_patterns.json" ]; then
        patterns_count=$(python3 -c "import json; print(len(json.load(open('storage/learning_patterns.json', 'r'))))" 2>/dev/null || echo "0")
    fi
    
    echo -e "${GREEN}  📍 Archaeological Sites: ${sites_count}${NC}"
    echo -e "${GREEN}  📋 Analysis Sessions: ${analyses_count}${NC}"
    echo -e "${GREEN}  🧠 Learning Patterns: ${patterns_count}${NC}"
    echo -e ""
    echo -e "${YELLOW}⚠️  Do you want to preserve your archaeological discoveries? (y/N)${NC}"
    read -p "   Preserve storage? " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}✅ Preserving archaeological storage${NC}"
        echo -e "${BLUE}💡 Your discoveries will be available after restart${NC}"
    else
        echo -e "${YELLOW}🗑️  Clearing archaeological storage...${NC}"
        rm -rf storage/* 2>/dev/null || true
        echo -e "${GREEN}✅ Archaeological storage cleared${NC}"
    fi
else
    echo -e "${BLUE}📁 Creating fresh storage directory...${NC}"
    mkdir -p storage
    echo -e "${GREEN}✅ Storage directory ready${NC}"
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

# Start fallback backend (reliable LIDAR & IKRP support)
echo -e "${GREEN}🚀 Starting NIS Protocol Fallback Backend...${NC}"
export REDIS_HOST=localhost
cd "$(dirname "$0")"

# Activate virtual environment if it exists
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    echo -e "${GREEN}✅ Virtual environment activated${NC}"
else
    echo -e "${YELLOW}⚠️  Virtual environment not found. Using system Python.${NC}"
fi

# Check if fallback_backend.py exists, fallback to simple_backend.py if not
if [ -f "fallback_backend.py" ]; then
    echo -e "${BLUE}🛡️  Starting reliable fallback backend with LIDAR & Real IKRP...${NC}"
    python fallback_backend.py &
    BACKEND_PID=$!
    BACKEND_PORT=8003
    BACKEND_TYPE="Fallback Backend"
else
    echo -e "${YELLOW}⚠️  fallback_backend.py not found, using simple_backend.py...${NC}"
    python simple_backend.py &
    BACKEND_PID=$!
    BACKEND_PORT=8000
    BACKEND_TYPE="Simple Backend"
fi

# Wait for backend to start
echo -e "${BLUE}⏳ Waiting for ${BACKEND_TYPE} to start...${NC}"
sleep 5

# Test backend health with timeout and retries
echo -e "${BLUE}🔍 Testing ${BACKEND_TYPE} health...${NC}"
backend_ready=false
for i in {1..6}; do
    if curl -s --connect-timeout 5 http://localhost:${BACKEND_PORT}/system/health > /dev/null; then
        echo -e "${GREEN}✅ ${BACKEND_TYPE} is healthy${NC}"
        backend_ready=true
        break
    else
        echo -e "${YELLOW}⏳ ${BACKEND_TYPE} not ready yet, attempt $i/6...${NC}"
        sleep 5
    fi
done

if [ "$backend_ready" = false ]; then
    echo -e "${YELLOW}⚠️  ${BACKEND_TYPE} health check failed or timed out after 30 seconds${NC}"
    echo -e "${BLUE}💡 Backend may still be starting up. Check http://localhost:${BACKEND_PORT}/docs manually${NC}"
fi

# Start frontend
echo -e "${GREEN}🚀 Starting frontend...${NC}"
cd frontend

# Use the correct port (3000 to match docker-compose.yml)
export PORT=3000
NPM_CMD=$(get_npm_cmd)
$NPM_CMD run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo -e "${BLUE}⏳ Waiting for frontend to start...${NC}"
sleep 10

# Test frontend with timeout
echo -e "${BLUE}🔍 Testing frontend...${NC}"
if curl -s --connect-timeout 10 http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend health check failed or timed out${NC}"
fi

cd ..

echo ""
echo -e "${GREEN}🎉 NIS System Reset Complete!${NC}"
echo ""
echo -e "${BLUE}📊 System Status:${NC}"
echo -e "   ${BACKEND_TYPE}: ${GREEN}http://localhost:${BACKEND_PORT}${NC}"
if [ "$BACKEND_TYPE" = "Fallback Backend" ]; then
    echo -e "   Features:     ${GREEN}✅ LIDAR Processing ✅ Real IKRP ✅ Archaeological Analysis${NC}"
fi
echo -e "   Frontend:     ${GREEN}http://localhost:3000${NC}"
if check_docker; then
    echo -e "   Redis:        ${GREEN}localhost:6379${NC}"
else
    echo -e "   Redis:        ${YELLOW}Not started (Docker unavailable)${NC}"
fi
echo -e "   Storage:      ${GREEN}./storage/ (persistent discoveries)${NC}"
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
echo -e "${BLUE}🛡️  System Architecture:${NC}"
echo -e "   • Fallback Backend provides reliable LIDAR processing and Real IKRP integration"
echo -e "   • Frontend automatically detects and uses available backend services"
echo -e "   • Persistent storage preserves archaeological discoveries across restarts"
echo -e "   • Full Docker deployment available via: ${YELLOW}./start.sh${NC}"
echo "" 