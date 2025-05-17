#!/bin/bash

# Stop script for the NIS Protocol project

echo "Stopping all services..."

# Stop the API server
pkill -f "python run_api.py"
sleep 2

# Stop the frontend
pkill -f "node.*start"
sleep 2

# Stop Kafka
kafka-server-stop
sleep 3

# Stop Zookeeper
zookeeper-server-stop
sleep 2

# Stop Redis
redis-cli shutdown
sleep 1

# Verify all services are stopped
echo "Verifying all services are stopped..."
sleep 2

SERVICES_RUNNING=false

# Check if services are still running
if lsof -i :8000 > /dev/null; then
    echo "Warning: API server is still running on port 8000"
    SERVICES_RUNNING=true
fi

if lsof -i :3000 > /dev/null; then
    echo "Warning: Frontend is still running on port 3000"
    SERVICES_RUNNING=true
fi

if lsof -i :9092 > /dev/null; then
    echo "Warning: Kafka is still running on port 9092"
    SERVICES_RUNNING=true
fi

if lsof -i :2181 > /dev/null; then
    echo "Warning: Zookeeper is still running on port 2181"
    SERVICES_RUNNING=true
fi

if lsof -i :6379 > /dev/null; then
    echo "Warning: Redis is still running on port 6379"
    SERVICES_RUNNING=true
fi

if [ "$SERVICES_RUNNING" = true ]; then
    echo "Some services are still running. You may need to stop them manually."
else
    echo "All services stopped successfully!"
fi 