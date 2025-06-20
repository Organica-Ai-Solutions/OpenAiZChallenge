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
}

# Check if Docker daemon is running
check_docker_daemon() {
    if ! docker info >/dev/null 2>&1; then
        error_log "Docker daemon is not running. Please start Docker Desktop."
        echo -e "\n${YELLOW}To fix this issue:${RESET}"
        echo -e "1. Open Docker Desktop application"
        echo -e "2. Wait for Docker to start completely"
        echo -e "3. Re-run this script"
        echo -e "\n${CYAN}Alternatively, you can run the reset script which doesn't require Docker Compose:${RESET}"
        echo -e "   ./reset_nis_system.sh"
        exit 1
    fi
    log "Docker daemon is running and accessible" "SUCCESS"
}

# Trap any errors
trap 'error_log "An error occurred. Check the log file at $ERROR_LOG_FILE"' ERR

# Check memory for macOS and Linux
check_memory() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        local total_memory=$(sysctl -n hw.memsize | awk '{print $1/1024/1024/1024 " GB"}')
        log "Total Memory: $total_memory"
        
        local memory_gb=$(echo "$total_memory" | cut -d' ' -f1)
        if (( $(echo "$memory_gb < 8" | bc -l 2>/dev/null || echo "0") )); then
            log "WARNING: Low memory detected. Some operations might be slow." "WARNING"
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        local total_memory=$(free -h | awk '/^Mem:/ {print $2}')
        log "Total Memory: $total_memory"
    else
        # Windows/Other
        log "Memory check skipped on this platform"
    fi
}

# Check disk space for macOS/Linux
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
        value_gb=$(echo "$value * 1024" | bc -l 2>/dev/null || echo "$value")
    elif [[ "$unit" == "M" || "$unit" == "MB" ]]; then
        value_gb=$(echo "$value / 1024" | bc -l 2>/dev/null || echo "1")
    elif [[ "$unit" == "K" || "$unit" == "KB" ]]; then
        value_gb=$(echo "$value / 1024 / 1024" | bc -l 2>/dev/null || echo "1")
    elif [[ "$unit" == "G" || "$unit" == "GB" || "$unit" == "Gi" ]]; then
        # Value is already in a Gigabyte-compatible unit, no conversion needed
        : # No operation needed
    else
        log "Unknown disk space unit '$unit' from output '$df_output'. Assuming Gigabytes for comparison, but this might be inaccurate." "WARNING"
    fi
    
    # Ensure value_gb is not empty and is a number before comparison
    if ! [[ "$value_gb" =~ ^[0-9]+(\.[0-9]+)?$ ]]; then
        log "Parsed value '$value_gb' is not a valid number for comparison. Skipping disk space check." "WARNING"
        return
    fi

    log "Available Disk Space (parsed): $value_gb GB"

    if (( $(echo "$value_gb < 10" | bc -l 2>/dev/null || echo "0") )); then
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
    
    # Check if Docker daemon is running
    check_docker_daemon

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

    if [ ! -f "${BASE_DIR}/frontend/Dockerfile.dev" ]; then
        error_log "frontend/Dockerfile.dev not found. Needed for building the frontend service."
        exit 1
    fi
        
    # Validate critical environment variables
    if [ -f "${BASE_DIR}/.env" ]; then
        REQUIRED_ENV_VARS=("OPENAI_API_KEY") # Removed SECRET_KEY as it's not critical for startup
        missing_vars=0
        for var in "${REQUIRED_ENV_VARS[@]}"; do
            if ! grep -q "^${var}=" "${BASE_DIR}/.env"; then
                log "Missing environment variable in .env: $var" "WARNING"
                missing_vars=$((missing_vars + 1))
            fi
        done
        if [ "$missing_vars" -gt 0 ]; then
            log "Some environment variables are missing but the system can still start" "WARNING"
        fi
    else
        log ".env file not found. Please create one with necessary configurations (e.g., OPENAI_API_KEY)." "WARNING"
    fi
    
    log "Project Setup Validation Completed" "SUCCESS"
}

# Pre-flight Checks
function pre_flight_checks() {
    log "${YELLOW}🛫 Running Pre-flight Checks...${RESET}"
    
    if ! ping -c 1 8.8.8.8 &> /dev/null; then # Check with only 1 packet to speed it up
        log "No internet connection detected. Docker image pulls or other operations might fail." "WARNING"
    fi
    
    log "Pre-flight Checks Completed" "SUCCESS"
}

# Archaeological Discovery Animation - Epic ASCII Workflow
function archaeological_animation() {
    clear
    echo -e "${GREEN}🏛️ Archaeological Discovery Platform - Powered by NIS Protocol 🏛️${RESET}"
    echo -e "${BLUE}    Developed by Organica AI Solutions (https://organicaai.com)${RESET}"
    echo ""
    
    # Step 1: Satellite Search
    echo -e "${CYAN}════════════════════════════════════════════════════════════════════${RESET}"
    echo -e "${YELLOW}                    🛰️  SATELLITE SEARCH PHASE  🛰️${RESET}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════════════${RESET}"
    echo -e "${BLUE}"
    cat << "EOF"
                    ╭─────────────────────────╮
                    │    🛰️  SENTINEL-2       │
                    │   ┌─────────────────┐   │
                    │   │ ░░░░░░░░░░░░░░░ │   │
                    │   │ ░▓▓▓▓▓▓▓▓▓▓▓▓░ │   │
                    │   │ ░▓████████████▓░ │   │
                    │   │ ░▓██ SCANNING ██▓░ │   │
                    │   │ ░▓████████████▓░ │   │
                    │   │ ░▓▓▓▓▓▓▓▓▓▓▓▓░ │   │
                    │   │ ░░░░░░░░░░░░░░░ │   │
                    │   └─────────────────┘   │
                    ╰─────────────────────────╯
EOF
    echo -e "${RESET}"
    
    for i in {1..5}; do
        printf "${YELLOW}    🔍 Scanning coordinates: [%-20s] %d%%${RESET}\r" $(printf "█%.0s" $(seq 1 $((i*4)))) $((i * 20))
        sleep 0.4
    done
    echo -e "\n${GREEN}    ✅ Satellite imagery acquired!${RESET}"
    sleep 1
    
    # Step 2: AI Analysis
    clear
    echo -e "${CYAN}════════════════════════════════════════════════════════════════════${RESET}"
    echo -e "${MAGENTA}                     🤖  AI ANALYSIS PHASE  🤖${RESET}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════════════${RESET}"
    echo -e "${GREEN}"
    cat << "EOF"
                 ╭───────────────────────────────╮
                 │        🧠 GPT-4o VISION       │
                 │                               │
                 │  ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐    │
                 │  │█│ │█│ │█│ │█│ │█│ │█│    │
                 │  └─┘ └─┘ └─┘ └─┘ └─┘ └─┘    │
                 │   ↓   ↓   ↓   ↓   ↓   ↓     │
                 │  ╔═══════════════════════╗   │
                 │  ║    NEURAL NETWORK     ║   │
                 │  ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   ║   │
                 │  ║  ████ PROCESSING ████  ║   │
                 │  ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   ║   │
                 │  ╚═══════════════════════╝   │
                 ╰───────────────────────────────╯
EOF
    echo -e "${RESET}"
    
    echo -e "${YELLOW}    🔬 Analyzing patterns..."
    for pattern in "Geometric anomalies" "Vegetation signatures" "Soil composition" "Historical markers" "Cultural indicators"; do
        printf "${BLUE}    ▶ Detecting: %-20s" "$pattern"
        sleep 0.3
        echo -e "${GREEN} ✓${RESET}"
    done
    sleep 1
    
    # Step 3: IKRP Cultural Analysis
    clear
    echo -e "${CYAN}════════════════════════════════════════════════════════════════════${RESET}"
    echo -e "${MAGENTA}                   📜  CULTURAL ANALYSIS  📜${RESET}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════════════${RESET}"
    echo -e "${YELLOW}"
    cat << "EOF"
              ╭─────────────────────────────────────╮
              │         📚 IKRP CODEX 📚           │
              │                                     │
              │    ┌─────────────────────────────┐  │
              │    │  Indigenous Knowledge       │  │
              │    │  ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐      │  │
              │    │  │🏛│ │🌿│ │⚱│ │🗿│ │📜│      │  │
              │    │  └─┘ └─┘ └─┘ └─┘ └─┘      │  │
              │    │                             │  │
              │    │  Cultural Context Engine   │  │
              │    │  ░░░░░░░░░░░░░░░░░░░░░░░    │  │
              │    │  ▓▓▓ CROSS-REFERENCING ▓▓▓  │  │
              │    │  ░░░░░░░░░░░░░░░░░░░░░░░    │  │
              │    └─────────────────────────────┘  │
              ╰─────────────────────────────────────╯
EOF
    echo -e "${RESET}"
    
    echo -e "${CYAN}    🔍 Cross-referencing with cultural databases..."
    cultural_items=("Ancestral territories" "Traditional settlements" "Sacred sites" "Migration patterns" "Oral histories")
    for item in "${cultural_items[@]}"; do
        printf "${MAGENTA}    ◆ Analyzing: %-25s" "$item"
        sleep 0.3
        echo -e "${GREEN} ✓${RESET}"
    done
    sleep 1
    
    # Step 4: Discovery Integration
    clear
    echo -e "${CYAN}════════════════════════════════════════════════════════════════════${RESET}"
    echo -e "${GREEN}                  🏛️  DISCOVERY SYNTHESIS  🏛️${RESET}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════════════${RESET}"
    echo -e "${BLUE}"
    cat << "EOF"
                    ╭─────────────────────────╮
                    │    🧩 INTEGRATION HUB   │
                    │                         │
                    │  🛰️ ────┐              │
                    │           ├─── 🏛️       │
                    │  🤖 ────┘              │
                    │           ┌─── 📊       │
                    │  📜 ────┘              │
                    │                         │
                    │   ┌─────────────────┐   │
                    │   │ ████ FUSION ████ │   │
                    │   │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │   │
                    │   │ ░░░░░░░░░░░░░░░ │   │
                    │   └─────────────────┘   │
                    ╰─────────────────────────╯
EOF
    echo -e "${RESET}"
    
    echo -e "${YELLOW}    ⚡ Synthesizing multi-source intelligence..."
    sleep 1
    
    # Step 5: Storage & Results
    clear
    echo -e "${CYAN}════════════════════════════════════════════════════════════════════${RESET}"
    echo -e "${GREEN}                    💾  PERSISTENT STORAGE  💾${RESET}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════════════${RESET}"
    echo -e "${MAGENTA}"
    cat << "EOF"
                 ╭───────────────────────────────╮
                 │      🗄️  DISCOVERY VAULT      │
                 │                               │
                 │  ┌─────────────────────────┐  │
                 │  │ archaeological_sites.json│  │
                 │  │ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐    │  │
                 │  │ │📍│ │📍│ │📍│ │📍│ │📍│    │  │
                 │  │ └─┘ └─┘ └─┘ └─┘ └─┘    │  │
                 │  └─────────────────────────┘  │
                 │                               │
                 │  ┌─────────────────────────┐  │
                 │  │ learning_patterns.json  │  │
                 │  │ 🧠🧠🧠🧠🧠🧠🧠🧠🧠🧠🧠 │  │
                 │  └─────────────────────────┘  │
                 ╰───────────────────────────────╯
EOF
    echo -e "${RESET}"
    
    echo -e "${GREEN}    💾 Storing discoveries permanently..."
    echo -e "${BLUE}    🔄 Building AI learning patterns..."
    echo -e "${YELLOW}    📊 Updating knowledge base..."
    sleep 2
    
    # Final Results Display
    clear
    echo -e "${GREEN}🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉${RESET}"
    echo -e "${CYAN}                        ⭐ DISCOVERY COMPLETE! ⭐${RESET}"
    echo -e "${GREEN}🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉${RESET}"
    echo ""
    echo -e "${BLUE}"
    cat << "EOF"
                    ╔═══════════════════════════╗
                    ║     🏛️ ARCHAEOLOGICAL     ║
                    ║       SITE DETECTED       ║
                    ║                           ║
                    ║  Confidence: 94.7% ⭐⭐⭐  ║
                    ║  Cultural Significance:   ║
                    ║       🔺 HIGH 🔺          ║
                    ║                           ║
                    ║  📍 Location Preserved    ║
                    ║  🧠 AI Pattern Learned    ║
                    ║  📜 Cultural Context Set  ║
                    ╚═══════════════════════════╝
EOF
    echo -e "${RESET}"
    echo ""
    echo -e "${YELLOW}🌍 Discovering Indigenous Heritage with Respect and AI Intelligence${RESET}"
    echo -e "${GREEN}🚀 System Ready for Real-Time Archaeological Discovery!${RESET}"
    sleep 2
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
    archaeological_animation
    nis_banner
    
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
    
    # Clean up any standalone containers that might conflict
    log "Cleaning up standalone Docker containers..."
    docker stop nis-redis-simple 2>/dev/null || true
    docker rm nis-redis-simple 2>/dev/null || true
    docker stop nis-kafka 2>/dev/null || true
    docker rm nis-kafka 2>/dev/null || true
    docker stop nis-zookeeper 2>/dev/null || true
    docker rm nis-zookeeper 2>/dev/null || true
    
    # Stop any development processes that might conflict with ports
    log "Stopping development processes..."
    pkill -f "python run_api.py" 2>/dev/null || true
    pkill -f "python simple_backend.py" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    
    log "Building and starting services..."
    if ! $DOCKER_COMPOSE_CMD up -d --build --remove-orphans; then
        error_log "Failed to start services with Docker Compose. Check Docker logs and docker-compose.yml."
        # Attempt to show logs from failed services
        $DOCKER_COMPOSE_CMD logs --tail="50" | tee -a "$ERROR_LOG_FILE"
        exit 1
    fi
    
    log "Services started successfully. Waiting for health checks..."
    
    # Wait for services to be healthy
    sleep 10
    
    # Check service health
    log "Checking service health..."
    $DOCKER_COMPOSE_CMD ps
    
    # Get mapped ports from docker-compose ps
    BACKEND_HOST_PORT=$($DOCKER_COMPOSE_CMD port backend 8000 2>/dev/null | cut -d':' -f2 || echo "8000")
    FRONTEND_HOST_PORT=$($DOCKER_COMPOSE_CMD port frontend 3000 2>/dev/null | cut -d':' -f2 || echo "3000")
    IKRP_HOST_PORT=$($DOCKER_COMPOSE_CMD port ikrp 8001 2>/dev/null | cut -d':' -f2 || echo "8001")
    FALLBACK_HOST_PORT=$($DOCKER_COMPOSE_CMD port fallback-backend 8003 2>/dev/null | cut -d':' -f2 || echo "8003")

    echo -e "\n${YELLOW}🚀 Archaeological Discovery Platform is now LIVE! (Powered by NIS Protocol)${RESET}"
    echo -e "Main Backend (Python 3.12): ${BLUE}http://localhost:$BACKEND_HOST_PORT${RESET}"
    echo -e "IKRP Codex Service: ${BLUE}http://localhost:$IKRP_HOST_PORT${RESET}"
    echo -e "Fallback Backend: ${BLUE}http://localhost:$FALLBACK_HOST_PORT${RESET} ${YELLOW}(Reliable LIDAR & IKRP fallback)${RESET}"
    echo -e "Frontend Interface: ${GREEN}http://localhost:$FRONTEND_HOST_PORT${RESET}"
    echo -e "Documentation: ${GREEN}http://localhost:$FRONTEND_HOST_PORT/documentation${RESET}"
    echo -e "Organica AI Solutions: ${CYAN}https://organicaai.com${RESET}"
    echo -e ""
    echo -e "${CYAN}📡 System Architecture:${RESET}"
    echo -e "  • Main Backend (Docker): Python 3.12 with full Pydantic v2 compatibility"
    echo -e "  • IKRP Service (Docker): Codex discovery and archaeological analysis"
    echo -e "  • Fallback Backend (Docker): Reliable LIDAR processing & Real IKRP"
    echo -e "  • Frontend (Docker): Next.js with optimized caching and error handling"
    echo -e "  • Infrastructure: Redis, Kafka, Zookeeper for distributed processing"
    echo -e ""
    echo -e "To view logs: ${CYAN}$DOCKER_COMPOSE_CMD logs -f${RESET}"
    echo -e "To stop services: ${CYAN}$DOCKER_COMPOSE_CMD down${RESET}"
    echo -e "Detailed startup logs: ${MAGENTA}$LOG_FILE${RESET}"
    
    log "Archaeological Discovery Platform startup completed successfully via Docker Compose."
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