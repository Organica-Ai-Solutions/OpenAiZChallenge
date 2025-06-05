#!/bin/bash

echo "🔧 Fixing NIS Protocol services..."

# Kill any existing processes
echo "🛑 Stopping existing services..."
pkill -f "python.*backend_main" 2>/dev/null || true
pkill -f "next.*dev" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true
lsof -ti:8000,3001,3002,3003 | xargs kill -9 2>/dev/null || true

# Wait a moment for processes to fully stop
sleep 2

# Clean frontend cache
echo "🧹 Cleaning frontend cache..."
cd frontend
rm -rf .next node_modules/.cache 2>/dev/null || true
cd ..

# Start backend
echo "🚀 Starting backend server..."
nohup python3 backend_main.py > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Test backend
if curl -s http://localhost:8000/system/health > /dev/null; then
    echo "✅ Backend started successfully on port 8000"
else
    echo "⚠️ Backend may still be starting..."
fi

# Start frontend
echo "🚀 Starting frontend server..."
cd frontend
nohup npm run dev -- --port 3003 > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 5

# Test frontend
if curl -s http://localhost:3003 > /dev/null; then
    echo "✅ Frontend started successfully on port 3003"
    echo "🌐 Open http://localhost:3003/map to access the map page"
else
    echo "⚠️ Frontend may still be starting..."
    echo "📋 Check frontend.log for details"
fi

echo "📊 Process IDs:"
echo "   Backend: $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"

echo "🎯 Services should be running at:"
echo "   Backend API: http://localhost:8000"
echo "   Frontend Map: http://localhost:3003/map"
echo "   System Health: http://localhost:8000/system/health" 