#!/bin/bash

echo "🔄 Resetting NIS System..."

# Stop any running processes
echo "📛 Stopping existing processes..."
pkill -f "python run_api.py" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

# Stop and remove existing Docker containers
echo "🐳 Cleaning up Docker containers..."
docker stop nis-redis-simple 2>/dev/null || true
docker rm nis-redis-simple 2>/dev/null || true

# Clean up any other NIS containers
docker ps -a | grep nis | awk '{print $1}' | xargs -r docker rm -f 2>/dev/null || true

# Clear Next.js cache
echo "🧹 Clearing frontend cache..."
if [ -d "frontend/.next" ]; then
    rm -rf frontend/.next
fi

if [ -d "frontend/node_modules/.cache" ]; then
    rm -rf frontend/node_modules/.cache
fi

# Clear Python cache
echo "🧹 Clearing Python cache..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true

# Clear logs
echo "🧹 Clearing logs..."
if [ -d "outputs/logs" ]; then
    rm -rf outputs/logs/*
fi

# Start Redis
echo "🚀 Starting Redis..."
docker run -d --name nis-redis-simple -p 6379:6379 redis:7-alpine

# Wait for Redis to start
echo "⏳ Waiting for Redis to start..."
sleep 3

# Start backend
echo "🚀 Starting backend..."
export REDIS_HOST=localhost
cd "$(dirname "$0")"
source venv/bin/activate 2>/dev/null || true
python run_api.py &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Test backend health
echo "🔍 Testing backend health..."
if curl -s http://localhost:8000/system/health > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

# Start frontend
echo "🚀 Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 10

# Test frontend
echo "🔍 Testing frontend..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend health check failed"
fi

echo ""
echo "🎉 NIS System Reset Complete!"
echo ""
echo "📊 System Status:"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:3001"
echo "   Redis:    localhost:6379"
echo ""
echo "🔧 Process IDs:"
echo "   Backend PID:  $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "📝 To stop the system:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   docker stop nis-redis-simple"
echo "" 