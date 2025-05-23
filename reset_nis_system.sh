#!/bin/bash

# Exit on any error
set -e

# Ensure we're in the project root
cd "$(dirname "$0")"

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

# Cleanup function
cleanup() {
    log "Cleaning up resources..."
    docker-compose down --volumes --remove-orphans || true
    docker network prune -f || true
}

# Trap signals to ensure cleanup
trap cleanup SIGINT SIGTERM ERR

# Main reset process
main() {
    log "Starting NIS System Reset..."

    # Ensure Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log "Docker Compose not found. Installing..."
        pip install docker-compose
    fi

    # Cleanup existing resources
    cleanup

    # Rebuild and start containers
    log "Rebuilding containers..."
    docker-compose build --no-cache

    log "Starting containers..."
    docker-compose up -d

    # Wait for services to be ready
    log "Waiting for services to initialize..."
    sleep 30

    # Prepare data sources
    log "Preparing data sources..."
    ./prepare_data_sources.sh

    # Create Kafka topics
    log "Setting up Kafka topics..."
    ./setup_kafka_topics.sh

    log "NIS System Reset Complete!"
}

# Run the main function
main 