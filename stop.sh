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

log "Stopping all NIS Protocol services managed by Docker Compose..."

# Determine Docker Compose command
DOCKER_COMPOSE_CMD="docker-compose"
if ! command -v docker-compose &> /dev/null && command -v docker && docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
fi

if $DOCKER_COMPOSE_CMD down --remove-orphans; then
    log "All Docker Compose services stopped successfully."
else
    error_log "Failed to stop Docker Compose services. Check Docker daemon and logs."
    # You might want to add specific checks here if needed, but `down` should handle it.
    exit 1
fi

log "NIS Protocol shutdown complete."
echo "All NIS services have been requested to stop via Docker Compose." 