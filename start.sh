#!/bin/bash

# Start script for the NIS Protocol project

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p data/{lidar,satellite,colonial_texts,overlays}
mkdir -p outputs/{findings,logs,memory}

# Check for required commands
echo "Checking required commands..."
command -v redis-server >/dev/null 2>&1 || { echo "Error: Redis is not installed. Install with: brew install redis"; exit 1; }
command -v kafka-server-start >/dev/null 2>&1 || { echo "Error: Kafka is not installed. Install with: brew install kafka"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "Error: npm is not installed. Install with: brew install node"; exit 1; }

# Setup Python environment
echo "Setting up Python environment..."
if [ -d "venv" ]; then
    echo "Removing existing virtual environment..."
    rm -rf venv
fi

echo "Creating new virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Start Redis Server (if not running)
if ! pgrep -x "redis-server" > /dev/null; then
    echo "Starting Redis Server..."
    redis-server --daemonize yes
    sleep 2
else
    echo "Redis Server is already running"
fi

# Start Zookeeper (if not running)
if ! lsof -i :2181 > /dev/null; then
    echo "Starting Zookeeper..."
    zookeeper-server-start /usr/local/etc/kafka/zookeeper.properties &
    sleep 5
else
    echo "Zookeeper is already running"
fi

# Start Kafka (if not running)
if ! lsof -i :9092 > /dev/null; then
    echo "Starting Kafka Server..."
    kafka-server-start /usr/local/etc/kafka/server.properties &
    sleep 5
else
    echo "Kafka Server is already running"
fi

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "Error: Frontend directory not found"
    exit 1
fi

# Start Frontend (if not running)
if ! lsof -i :3000 > /dev/null; then
    echo "Starting Frontend..."
    cd frontend
    npm install
    npm start &
    cd ..
    sleep 5
else
    echo "Frontend is already running on port 3000"
fi

# Start the API server
echo "Starting NIS Protocol API server..."
python run_api.py &

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 5

echo "All services started successfully!"
echo "Frontend running on: http://localhost:3000"
echo "Backend API running on: http://localhost:8000"
echo "Redis running on: localhost:6379"
echo "Kafka running on: localhost:9092"
echo
echo "To stop all services, run: ./stop.sh" 