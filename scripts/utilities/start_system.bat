@echo off
echo 🚀 Starting Archaeological Discovery System...
echo.

REM Start backend in one window
start "Backend (Port 8003)" cmd /k "python fallback_backend.py"
timeout /t 3

REM Start frontend in another window  
start "Frontend (Port 3001)" cmd /k "cd frontend && npm.cmd run dev"

echo ✅ System starting...
echo 📱 Frontend: http://localhost:3001
echo 🔧 Backend: http://localhost:8003
echo.
echo Press any key to exit...
pause 