#!/bin/bash

# Strict mode for better error handling
set -euo pipefail

# Docker container names
REDIS_CONTAINER_NAME="nis-redis"
ZOOKEEPER_CONTAINER_NAME="nis-zookeeper"
KAFKA_CONTAINER_NAME="nis-kafka"

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
    exit 1
}

# Trap any errors
trap 'error_log "An error occurred. Check the log file at $ERROR_LOG_FILE"' ERR

# Check memory for macOS
check_memory() {
    local total_memory=$(sysctl -n hw.memsize | awk '{print $1/1024/1024/1024 " GB"}')
    log "Total Memory: $total_memory"
    
    # Optional: Add a warning if memory is low
    local memory_gb=$(echo "$total_memory" | cut -d' ' -f1)
    if (( $(echo "$memory_gb < 8" | bc -l) )); then
        log "WARNING: Low memory detected. Some operations might be slow." "WARNING"
    fi
}

# Check disk space for macOS
check_disk_space() {
    local disk_space=$(df -h "$BASE_DIR" | awk 'NR==2 {print $4}')
    log "Available Disk Space: $disk_space"
    
    # Optional: Add a warning if disk space is low
    local space_gb=$(echo "$disk_space" | sed 's/G//')
    if (( $(echo "$space_gb < 10" | bc -l) )); then
        log "WARNING: Low disk space detected. Ensure at least 10GB is available." "WARNING"
    fi
}

# Comprehensive System Compatibility Check
function check_system_compatibility() {
    log "${CYAN}🔍 Performing Comprehensive System Compatibility Check...${RESET}"
    
    # Check Operating System
    OS=$(uname -s)
    ARCH=$(uname -m)
    log "Operating System: $OS $ARCH"
    
    # Minimum version requirements
    PYTHON_MIN_VERSION="3.9.0"
    NODE_MIN_VERSION="18.0.0"
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        error_log "Python 3 not found. Please install Python 3.9 or higher."
        exit 1
    fi
    
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    log "Python Version: $PYTHON_VERSION"
    
    # Compare Python version
    if [ "$(printf '%s\n' "$PYTHON_MIN_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" != "$PYTHON_MIN_VERSION" ]; then
        error_log "Python version too low. Minimum required: $PYTHON_MIN_VERSION, Current: $PYTHON_VERSION"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        error_log "Node.js not found. Please install Node.js 18 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | tr -d 'v')
    log "Node.js Version: $NODE_VERSION"
    
    # Compare Node.js version
    if [ "$(printf '%s\n' "$NODE_MIN_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$NODE_MIN_VERSION" ]; then
        error_log "Node.js version too low. Minimum required: $NODE_MIN_VERSION, Current: $NODE_VERSION"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error_log "npm not found. Please install npm."
        exit 1
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        error_log "Git not found. Please install Git."
        exit 1
    fi
    
    # Check available disk space for macOS
    DISK_SPACE=$(df -h "$BASE_DIR" | awk 'NR==2 {print $4}')
    log "Available Disk Space: $DISK_SPACE"
    
    # Check memory for macOS
    TOTAL_MEMORY=$(sysctl -n hw.memsize | awk '{print $1/1024/1024/1024 " GB"}')
    log "Total Memory: $TOTAL_MEMORY"
    
    log "System Compatibility Check Passed!" "SUCCESS"
}

# Dependency Validation
function validate_dependencies() {
    log "${BLUE}🔬 Validating Project Dependencies...${RESET}"
    
    # Check requirements.txt exists
    if [ ! -f "${BASE_DIR}/requirements.txt" ]; then
        error_log "requirements.txt not found. Cannot install dependencies."
        exit 1
    fi
    
    # Check package.json exists
    if [ ! -f "${BASE_DIR}/frontend/package.json" ]; then
        error_log "frontend/package.json not found. Cannot install frontend dependencies."
        exit 1
    fi
    
    # Validate critical environment variables
    if [ -f "${BASE_DIR}/.env" ]; then
        # Check for critical environment variables
        REQUIRED_ENV_VARS=("OPENAI_API_KEY" "SECRET_KEY")
        for var in "${REQUIRED_ENV_VARS[@]}"; do
            if ! grep -q "^${var}=" "${BASE_DIR}/.env"; then
                error_log "Missing critical environment variable: $var"
                exit 1
            fi
        done
    else
        error_log ".env file not found. Please create one with necessary configurations."
        exit 1
    fi
    
    log "Dependency Validation Completed Successfully" "SUCCESS"
}

# Pre-flight Checks
function pre_flight_checks() {
    log "${YELLOW}🛫 Running Pre-flight Checks...${RESET}"
    
    # Check network connectivity
    if ! ping -c 3 8.8.8.8 &> /dev/null; then
        error_log "No internet connection detected. Some features may be limited."
    fi
    
    # Check GitHub connectivity for potential updates
    if ! git ls-remote https://github.com/yourusername/openai-to-z-nis.git &> /dev/null; then
        log "Unable to connect to GitHub repository. Offline mode assumed." "WARNING"
    fi
    
    log "Pre-flight Checks Completed" "SUCCESS"
}

# Archaeological Discovery Animation
function archaeological_animation() {
    clear
    echo -e "${GREEN}🌿 NIS Protocol: Neural-Inspired Archaeological Discovery System 🌿${RESET}"
    echo ""
    
    # Simulated archaeological dig animation with progress bar
    for i in {1..10}; do
        printf "${YELLOW}🏺 Excavating: [%-10s] %d%%${RESET}\r" $(printf "#%.0s" $(seq 1 $i)) $((i * 10))
        sleep 0.2
    done
    echo -e "\n${BLUE}📡 Advanced Geospatial Analysis Initialized${RESET}"
    sleep 1
    
    echo -e "\n${GREEN}🌍 Discovering Hidden Histories ${RESET}"
    sleep 1
}

# NIS Protocol Startup Banner
function nis_banner() {
    echo -e "${MAGENTA}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════════╗
║  禪  NEURAL-INSPIRED SYSTEM PROTOCOL  智                          ║
║                                                                   ║
║   🧠 Multi-Agent Intelligence | 🛰️ Geospatial Reasoning          ║
║   📜 Interpreting Ancient History with Modern AI                 ║
║   🐉 Inspired by the wisdom of the past — built for the future   ║
║                                                                   ║
║   📍 Amazon Rainforest | 🌏 Global Archaeology | 🤖 GPT-4.1       ║
╚═══════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${RESET}"




    echo -e "${MAGENTA}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════════╗
║  禪  NEURAL-INSPIRED SYSTEM PROTOCOL  智                          ║
║                                                                   ║
║   🧠 Multi-Agent Intelligence | 🛰️ Geospatial Reasoning          ║
║   📜 Interpreting Ancient History with Modern AI                 ║
║   🐉 Inspired by the wisdom of the past — built for the future   ║
║                                                                   ║
║   📍 Amazon Rainforest | 🌏 Global Archaeology | 🤖 GPT-4.1       ║
╚═══════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${RESET}"
}

# Dependency Installation with Retry Mechanism
function install_dependencies() {
    log "${BLUE}📦 Installing Dependencies...${RESET}"
    
    # Python Dependencies
    log "Installing Python dependencies..."
    max_retries=3
    retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        if pip install -r requirements.txt; then
            log "Python dependencies installed successfully"
            # Download spacy model if spacy is installed
            if python -c "import spacy; spacy.load('pt_core_news_lg')" &> /dev/null; then
                log "Spacy model 'pt_core_news_lg' already installed."
            else
                log "Downloading Spacy model 'pt_core_news_lg'..."
                if python -m spacy download pt_core_news_lg; then
                    log "Spacy model 'pt_core_news_lg' downloaded successfully."
                else
                    log "Failed to download 'pt_core_news_lg'. Manual installation may be required." "WARNING"
                fi
            fi
            break
        else
            ((retry_count++))
            error_log "Dependency installation failed. Retry $retry_count of $max_retries"
            sleep 2
        fi
    done
    
    if [ $retry_count -eq $max_retries ]; then
        error_log "Failed to install Python dependencies after $max_retries attempts"
        exit 1
    fi
    
    # Frontend Dependencies
    log "Installing Frontend dependencies..."
    cd frontend
    npm install || { error_log "Frontend dependency installation failed"; exit 1; }
    cd ..
}

# Dynamic Port Management
function find_available_port() {
    local start_port=$1
    local port=$start_port
    while lsof -i :$port > /dev/null 2>&1; do
        ((port++))
    done
    echo $port
}

# Main Startup Function
function startup_nis_protocol() {
    # Display Banner and Run Compatibility Check
    nis_banner
    check_system_compatibility
    archaeological_animation
    
    # Setup Virtual Environment
    log "${YELLOW}🔧 Setting up virtual environment...${RESET}"
    python3 -m venv venv || { error_log "Failed to create virtual environment"; exit 1; }
    # shellcheck source=/dev/null
    source venv/bin/activate || { error_log "Failed to activate virtual environment"; exit 1; }
    
    # Install Dependencies
    install_dependencies
    
    # Find available ports
    BACKEND_PORT=$(find_available_port 8000)
    FRONTEND_PORT=$(find_available_port 3000)
    
    # Set default ports if not already set
    export BACKEND_PORT=${BACKEND_PORT:-8000}
    export FRONTEND_PORT=${FRONTEND_PORT:-3000}
    export HOST=${HOST:-0.0.0.0}
    
    # Start Backend
    log "${CYAN}🌐 Launching Backend API on port $BACKEND_PORT...${RESET}"
    PORT=$BACKEND_PORT HOST=$HOST python run_api.py > "$LOG_FILE" 2>&1 &
    BACKEND_PID=$!
    
    # Wait for backend to start
    sleep 3

    # Start Frontend
    log "${GREEN}🖥️ Starting Frontend Development Server on port $FRONTEND_PORT...${RESET}"
    cd frontend
    BACKEND_PORT=$BACKEND_PORT \
    NEXT_PUBLIC_API_URL=http://localhost:$BACKEND_PORT \
    PORT=$FRONTEND_PORT \
    npm run dev >> "$LOG_FILE" 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    # Wait and Show Access Information
    sleep 5
    echo -e "\n${YELLOW}🚀 NIS Protocol is now LIVE!${RESET}"
    echo -e "Backend: ${BLUE}http://localhost:$BACKEND_PORT${RESET}"
    echo -e "Frontend: ${GREEN}http://localhost:$FRONTEND_PORT${RESET}"
    echo -e "Logs: ${MAGENTA}$LOG_FILE${RESET}"
    
    # Trap to ensure clean shutdown
    trap 'kill $BACKEND_PID $FRONTEND_PID; log "NIS Protocol shutdown complete."' SIGINT SIGTERM
    wait
}

# Main Execution
function main() {
    # Trap to capture any unexpected errors
    trap 'error_log "Unexpected error occurred. Check logs for details."' ERR
    
    # Run comprehensive checks
    check_system_compatibility
    validate_dependencies
    pre_flight_checks
    
    # Run the main startup protocol
    startup_nis_protocol
}

set -x # Enable command tracing
# --- Docker Service Management (Redis & Kafka) ---
log "🐳 Ensuring Docker services (Redis, Zookeeper, Kafka) are (re)started..."

# Stop and remove existing containers (ignore errors if they don't exist)
log "Stopping and removing existing Docker containers if they exist..."
docker stop "$REDIS_CONTAINER_NAME" > /dev/null 2>&1 || true
docker rm -f "$REDIS_CONTAINER_NAME" > /dev/null 2>&1 || true
docker stop "$KAFKA_CONTAINER_NAME" > /dev/null 2>&1 || true
docker rm -f "$KAFKA_CONTAINER_NAME" > /dev/null 2>&1 || true
docker stop "$ZOOKEEPER_CONTAINER_NAME" > /dev/null 2>&1 || true
docker rm -f "$ZOOKEEPER_CONTAINER_NAME" > /dev/null 2>&1 || true

log "Waiting a moment for ports to be released..."
sleep 3 # Wait for 3 seconds

# Start Redis
log "Starting Redis container '$REDIS_CONTAINER_NAME'..."
if ! docker run -d --name "$REDIS_CONTAINER_NAME" -p 127.0.0.1:6379:6379 redis:alpine; then
    log "Failed to start Redis container '$REDIS_CONTAINER_NAME'." "ERROR"
else
    log "Waiting for Redis ($REDIS_CONTAINER_NAME) to initialize..."
    sleep 5 # Give Redis a moment to start
    if docker ps -q -f name=^/${REDIS_CONTAINER_NAME}$ > /dev/null 2>&1; then
        log "Redis container '$REDIS_CONTAINER_NAME' started successfully."
    else
        log "Redis container '$REDIS_CONTAINER_NAME' failed to become ready." "ERROR"
    fi
fi

# Start Zookeeper
log "Starting Zookeeper container '$ZOOKEEPER_CONTAINER_NAME'..."
if ! docker run -d --name "$ZOOKEEPER_CONTAINER_NAME" -p 127.0.0.1:2181:2181 \
    -e ZOOKEEPER_CLIENT_PORT=2181 \
    -e ZOOKEEPER_TICK_TIME=2000 \
    confluentinc/cp-zookeeper:latest; then
    log "Failed to start Zookeeper container '$ZOOKEEPER_CONTAINER_NAME'." "ERROR"
else
    log "Waiting for Zookeeper ($ZOOKEEPER_CONTAINER_NAME) to initialize..."
    sleep 20 # Give Zookeeper more time to initialize
    if docker ps -q -f name=^/${ZOOKEEPER_CONTAINER_NAME}$ > /dev/null 2>&1; then
        log "Zookeeper container '$ZOOKEEPER_CONTAINER_NAME' started successfully."
    else
        log "Zookeeper container '$ZOOKEEPER_CONTAINER_NAME' failed to become ready." "ERROR"
    fi
fi

# Start Kafka
log "Starting Kafka container '$KAFKA_CONTAINER_NAME'..."
if ! docker run -d --name "$KAFKA_CONTAINER_NAME" \
    -p 127.0.0.1:9092:9092 \
    -e KAFKA_ZOOKEEPER_CONNECT=${ZOOKEEPER_CONTAINER_NAME}:2181 \
    -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://127.0.0.1:9092 \
    -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092 \
    -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
    -e KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS=0 \
    -e KAFKA_INTER_BROKER_LISTENER_NAME=PLAINTEXT \
    -e KAFKA_ZOOKEEPER_SESSION_TIMEOUT_MS=6000 \
    -e KAFKA_CREATE_TOPICS="nis.analysis.events:1:1,nis.batch.events:1:1,nis.statistics.events:1:1" \
    confluentinc/cp-kafka:latest; then
    log "Failed to start Kafka container '$KAFKA_CONTAINER_NAME'." "ERROR"
else
    log "Waiting for Kafka ($KAFKA_CONTAINER_NAME) to initialize..."
    sleep 60 # Give Kafka more time to initialize fully
    if docker ps -q -f name=^/${KAFKA_CONTAINER_NAME}$ > /dev/null 2>&1; then
        log "Kafka container '$KAFKA_CONTAINER_NAME' started successfully."
    else
        log "Kafka container '$KAFKA_CONTAINER_NAME' failed to become ready." "ERROR"
    fi
fi
# --- End Docker Service Management ---
set +x # Disable command tracing

# Execute main function
main 