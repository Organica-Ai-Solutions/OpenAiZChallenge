#!/bin/bash

# Strict mode for better error handling
set -euo pipefail

# Docker container names (can be removed if docker-compose handles all service naming)
# REDIS_CONTAINER_NAME="nis-redis"
# ZOOKEEPER_CONTAINER_NAME="nis-zookeeper"
# KAFKA_CONTAINER_NAME="nis-kafka"

# Enhanced Logging and Error Handling
SCRIPT_NAME=$(basename "$0")
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${BASE_DIR}/logs"
LOG_FILE="${LOG_DIR}/nis_startup_${TIMESTAMP}.log"
ERROR_LOG_FILE="${LOG_DIR}/nis_startup_error_${TIMESTAMP}.log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Clear/Initialize log files at the beginning of the script execution
> "$LOG_FILE"
> "$ERROR_LOG_FILE"

# ANSI Color Codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RESET='\033[0m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'

# Logging function with macOS compatibility
log() {
    local level="${2:-INFO}"
    echo -e "[${level}] [$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error_log() {
    echo -e "\033[0;31m[ERROR] $1\033[0m" | tee -a "$ERROR_LOG_FILE" >&2
    # Removed exit 1 to allow script to attempt cleanup or further actions if needed.
    # Consider adding exit 1 back if immediate script termination on any error is desired.
}

# Trap any errors
trap 'error_log "An error occurred. Check the log file at $ERROR_LOG_FILE"' ERR

# Check memory for macOS
check_memory() {
    local total_memory=$(sysctl -n hw.memsize | awk '{print $1/1024/1024/1024 " GB"}')
    log "Total Memory: $total_memory"
    
    local memory_gb=$(echo "$total_memory" | cut -d' ' -f1)
    if (( $(echo "$memory_gb < 8" | bc -l) )); then
        log "WARNING: Low memory detected. Some operations might be slow." "WARNING"
    fi
}

# Check disk space for macOS
check_disk_space() {
    local df_output
    df_output=$(df -h "$BASE_DIR" | awk 'NR==2 {print $4}')
    log "Available Disk Space (raw): $df_output"

    local unit="${df_output//[0-9.]/}" # Extract unit (G, M, T, etc.)
    local value="${df_output//[^0-9.]/}" # Extract numeric value

    if [[ -z "$value" ]]; then
        log "Could not parse available disk space from: '$df_output'. Skipping check." "WARNING"
        return
    fi

    local value_gb="$value"

    if [[ "$unit" == "T" || "$unit" == "TB" ]]; then
        value_gb=$(echo "$value * 1024" | bc -l)
    elif [[ "$unit" == "M" || "$unit" == "MB" ]]; then
        value_gb=$(echo "$value / 1024" | bc -l)
    elif [[ "$unit" == "K" || "$unit" == "KB" ]]; then
        value_gb=$(echo "$value / 1024 / 1024" | bc -l)
    elif [[ "$unit" == "G" || "$unit" == "GB" || "$unit" == "Gi" ]]; then
        # Value is already in a Gigabyte-compatible unit, no conversion needed for value_gb itself
        # This case prevents falling into the "Unknown unit" log for G, GB, Gi
        : # No operation needed, value_gb is already $value which is in G/GB/Gi
    else
        log "Unknown disk space unit '$unit' from output '$df_output'. Assuming Gigabytes for comparison, but this might be inaccurate." "WARNING"
    fi
    
    # Ensure value_gb is not empty and is a number before comparison
    if ! [[ "$value_gb" =~ ^[0-9]+(\.[0-9]+)?$ ]]; then
        log "Parsed value '$value_gb' is not a valid number for comparison. Skipping disk space check." "WARNING"
        return
    fi

    log "Available Disk Space (parsed): $value_gb GB"

    if (( $(echo "$value_gb < 10" | bc -l 2>/dev/null) )); then
        log "WARNING: Low disk space detected ($value_gb GB). Ensure at least 10GB is available." "WARNING"
    fi
}

# Comprehensive System Compatibility Check
function check_system_compatibility() {
    log "${CYAN}🔍 Performing System Compatibility Check...${RESET}"
    
    OS=$(uname -s)
    ARCH=$(uname -m)
    log "Operating System: $OS $ARCH"
    
    if ! command -v docker &> /dev/null; then
        error_log "Docker not found. Please install Docker."
        exit 1
    fi
    log "Docker Version: $(docker --version)"

    if ! command -v docker-compose &> /dev/null; then
        # Try docker compose (v2 syntax)
        if docker compose version &> /dev/null; then
            log "Docker Compose (v2) found: $(docker compose version)"
        else
            error_log "Docker Compose not found. Please install Docker Compose (either v1 'docker-compose' or v2 'docker compose')."
            exit 1
        fi
    else
         log "Docker Compose (v1) found: $(docker-compose --version)"
    fi
        
    if ! command -v git &> /dev/null; then
        error_log "Git not found. Please install Git."
        exit 1
    fi
    log "Git Version: $(git --version)"

    check_disk_space
    check_memory
    
    log "System Compatibility Check Passed!" "SUCCESS"
}

# Dependency Validation
function validate_dependencies() {
    log "${BLUE}🔬 Validating Project Setup...${RESET}"
    
    if [ ! -f "${BASE_DIR}/docker-compose.yml" ]; then
        error_log "docker-compose.yml not found. This script relies on Docker Compose."
        exit 1
    fi

    if [ ! -f "${BASE_DIR}/Dockerfile" ]; then
        error_log "Dockerfile not found. Needed for building the backend service."
        exit 1
    fi

    if [ ! -f "${BASE_DIR}/frontend/Dockerfile" ]; then
        error_log "frontend/Dockerfile not found. Needed for building the frontend service."
        exit 1
    fi
        
    # Validate critical environment variables
    if [ -f "${BASE_DIR}/.env" ]; then
        REQUIRED_ENV_VARS=("OPENAI_API_KEY" "SECRET_KEY") # Add other critical vars if any
        missing_vars=0
        for var in "${REQUIRED_ENV_VARS[@]}"; do
            if ! grep -q "^${var}=" "${BASE_DIR}/.env"; then
                log "Missing critical environment variable in .env: $var" "WARNING"
                missing_vars=$((missing_vars + 1))
            fi
        done
        if [ "$missing_vars" -gt 0 ]; then
            log "Ensure all critical environment variables are set in .env" "WARNING"
            # Decide if this should be a fatal error: exit 1
        fi
    else
        log ".env file not found. Please create one with necessary configurations (e.g., OPENAI_API_KEY, SECRET_KEY)." "WARNING"
        # Decide if this should be a fatal error: exit 1
    fi
    
    log "Project Setup Validation Completed" "SUCCESS"
}

# Pre-flight Checks
function pre_flight_checks() {
    log "${YELLOW}🛫 Running Pre-flight Checks...${RESET}"
    
    if ! ping -c 1 8.8.8.8 &> /dev/null; then # Check with only 1 packet to speed it up
        log "No internet connection detected. Docker image pulls or other operations might fail." "WARNING"
    fi
    
    # Check GitHub connectivity for potential updates (optional, can be removed if not needed)
    # if ! git ls-remote https://github.com/yourusername/openai-to-z-nis.git &> /dev/null; then
    #     log "Unable to connect to GitHub repository. Offline mode assumed." "WARNING"
    # fi
    
    log "Pre-flight Checks Completed" "SUCCESS"
}

# Archaeological Discovery Animation
function archaeological_animation() {
    clear
    echo -e "${GREEN}🏛️ Archaeological Discovery Platform - Powered by NIS Protocol 🏛️${RESET}"
    echo -e "${BLUE}    Developed by Organica AI Solutions (https://organicaai.com)${RESET}"
    echo ""
    
    for i in {1..10}; do
        printf "${YELLOW}🔍 Initializing Discovery Systems: [%-10s] %d%%${RESET}\r" $(printf "#%.0s" $(seq 1 $i)) $((i * 10))
        sleep 0.2
    done
    echo -e "\n${BLUE}🛰️ AI-Powered Archaeological Analysis Ready${RESET}"
    sleep 1
    
    echo -e "\n${GREEN}🌍 Discovering Indigenous Heritage with Respect ${RESET}"
    sleep 1
}

# Archaeological Discovery Platform Banner
function nis_banner() {
    echo -e "${MAGENTA}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════════╗
║  🏛️  ARCHAEOLOGICAL DISCOVERY PLATFORM  🏛️                         ║
║                                                                   ║
║   🧠 NIS Protocol by Organica AI Solutions                       ║
║   🔍 AI-Powered Indigenous Archaeological Research               ║
║   🌍 Respecting Cultural Heritage & Traditional Knowledge        ║
║                                                                   ║
║   🛰️ Satellite Analysis | 🤖 OpenAI GPT-4o | 📜 Cultural Context ║
║   Visit: https://organicaai.com                                  ║
╚═══════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${RESET}"
}

# Main Startup Function
function startup_nis_protocol() {
    nis_banner
    # archaeological_animation # Consider if this is needed before docker-compose output

    log "${CYAN}🚀 Launching NIS Protocol services using Docker Compose...${RESET}"
    
    # Determine Docker Compose command
    DOCKER_COMPOSE_CMD="docker-compose"
    if ! command -v docker-compose &> /dev/null && command -v docker && docker compose version &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker compose"
    fi

    # Stop any running services first to ensure a clean start and handle port conflicts
    log "Stopping existing Docker Compose services (if any)..."
    if ! $DOCKER_COMPOSE_CMD down --remove-orphans; then
        log "Failed to stop existing services. Proceeding with caution." "WARNING"
    else
        log "Existing services stopped."
    fi
    
    log "Building and starting services in detached mode..."
    if ! $DOCKER_COMPOSE_CMD up -d --build --remove-orphans; then
        error_log "Failed to start services with Docker Compose. Check Docker logs and docker-compose.yml."
        # Attempt to show logs from failed services
        $DOCKER_COMPOSE_CMD logs --tail="50" | tee -a "$ERROR_LOG_FILE"
        exit 1
    fi
    
    log "Services started in detached mode. Tailing logs..."
    
    # Wait and Show Access Information
    sleep 5 # Give services a moment to initialize
    
    # Get mapped ports from docker-compose ps (this is more robust)
    # Assuming service names in docker-compose.yml are 'backend' and 'frontend'
    # And they map to host ports.
    
    # Try to get backend port
    BACKEND_HOST_PORT=$($DOCKER_COMPOSE_CMD port backend 8000 | cut -d':' -f2)
    if [ -z "$BACKEND_HOST_PORT" ]; then
        log "Could not determine backend port automatically. Assuming 8000." "WARNING"
        BACKEND_HOST_PORT="8000" # Fallback
    fi
    
    # Try to get frontend port
    FRONTEND_HOST_PORT=$($DOCKER_COMPOSE_CMD port frontend 3000 | cut -d':' -f2)
    if [ -z "$FRONTEND_HOST_PORT" ]; then
        log "Could not determine frontend port automatically. Assuming 3000." "WARNING"
        FRONTEND_HOST_PORT="3000" # Fallback
    fi

    echo -e "\n${YELLOW}🚀 Archaeological Discovery Platform is now LIVE! (Powered by NIS Protocol)${RESET}"
    echo -e "Backend API: ${BLUE}http://localhost:$BACKEND_HOST_PORT${RESET}"
    echo -e "Frontend Interface: ${GREEN}http://localhost:$FRONTEND_HOST_PORT${RESET}"
    echo -e "Documentation: ${GREEN}http://localhost:$FRONTEND_HOST_PORT/documentation${RESET}"
    echo -e "Organica AI Solutions: ${CYAN}https://organicaai.com${RESET}"
    echo -e "To view logs: ${CYAN}$DOCKER_COMPOSE_CMD logs -f${RESET}"
    echo -e "To stop services: ${CYAN}$DOCKER_COMPOSE_CMD down${RESET}"
    echo -e "Detailed startup logs: ${MAGENTA}$LOG_FILE${RESET}"
    
    log "Archaeological Discovery Platform startup initiated via Docker Compose. Monitor service logs for status."

    # The script can now exit, or tail logs if preferred.
    # To keep the script running and tailing logs:
    # log "Tailing combined logs. Press Ctrl+C to stop."
    # $DOCKER_COMPOSE_CMD logs -f
    # trap '$DOCKER_COMPOSE_CMD down; log "NIS Protocol shutdown complete."' SIGINT SIGTERM
    # wait
}

# Main Execution
function main() {
    trap 'error_log "Unexpected error occurred during main execution. Check logs for details."' ERR
    
    check_system_compatibility
    validate_dependencies
    pre_flight_checks
    
    startup_nis_protocol
}

# --- Docker Service Management (Redis & Kafka) ---
# This section is now handled by docker-compose.yml and the startup_nis_protocol function.
# The commands below are removed as docker-compose will manage these services.
# log "🐳 Ensuring Docker services (Redis, Zookeeper, Kafka) are (re)started..."
# ... (removed manual docker stop/rm/run commands for redis, zookeeper, kafka) ...

# set -x # Enable command tracing if needed for debugging docker-compose calls
main
# set +x # Disable command tracing

# Execute main function
# main # This line is a duplicate and will be removed 