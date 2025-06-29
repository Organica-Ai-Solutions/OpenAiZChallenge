#!/bin/bash

# Stop script for the NIS Protocol project

# Enhanced Logging and Error Handling
SCRIPT_NAME=$(basename "$0")
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${BASE_DIR}/logs"
STOP_LOG_FILE="${LOG_DIR}/nis_stop_${TIMESTAMP}.log"
ERROR_LOG_FILE="${LOG_DIR}/nis_stop_error_${TIMESTAMP}.log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Clear/Initialize log files
> "$STOP_LOG_FILE"
> "$ERROR_LOG_FILE"

# Logging function
log() {
    echo "[INFO] [$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$STOP_LOG_FILE"
}

error_log() {
    echo "[ERROR] [$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$ERROR_LOG_FILE" >&2
}

trap 'error_log "An error occurred during shutdown. Check $ERROR_LOG_FILE"' ERR

echo -e "\033[0;36m🛑 Stopping NIS Protocol Archaeological Discovery Platform...\033[0m"
log "Stopping all NIS Protocol services managed by Docker Compose..."

# Determine Docker Compose command
DOCKER_COMPOSE_CMD="docker-compose"
if ! command -v docker-compose &> /dev/null && command -v docker && docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
fi

# Stop all services gracefully
log "Stopping Docker Compose services..."
if $DOCKER_COMPOSE_CMD down --remove-orphans --volumes; then
    log "All Docker Compose services stopped successfully."
else
    error_log "Failed to stop Docker Compose services. Attempting force cleanup..."
    
    # Force stop individual containers if compose fails
    log "Force stopping individual containers..."
    docker stop $(docker ps -q --filter "name=openaizchallenge") 2>/dev/null || true
    docker rm $(docker ps -aq --filter "name=openaizchallenge") 2>/dev/null || true
fi

# Clean up any standalone containers
log "Cleaning up standalone containers..."
docker stop nis-redis-simple nis-kafka nis-zookeeper 2>/dev/null || true
docker rm nis-redis-simple nis-kafka nis-zookeeper 2>/dev/null || true

# Stop any standalone backend processes
log "Stopping any standalone backend processes..."
pkill -f "python.*backend" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

# Clean up any remaining processes on key ports
log "Cleaning up processes on key ports..."
for port in 3000 8000 8001 8003 6379 9092 2181; do
    if netstat -ano | grep ":$port " >/dev/null 2>&1; then
        log "Cleaning up port $port..."
        if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
            netstat -ano | grep ":$port " | awk '{print $5}' | xargs -r taskkill //PID //F 2>/dev/null || true
        else
            lsof -ti:$port | xargs -r kill -9 2>/dev/null || true
        fi
    fi
done

log "NIS Protocol shutdown complete."
echo -e "\033[0;32m✅ All NIS Protocol services have been stopped successfully.\033[0m"
echo -e "\033[0;34mTo restart the system, run: ./start.sh\033[0m" 