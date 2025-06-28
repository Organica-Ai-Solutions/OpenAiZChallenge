@echo off
REM NIS Protocol Fallback Backend Startup Script for Windows
REM This script starts the fallback backend

echo 🚀 Starting NIS Protocol Fallback Backend...

REM Check if Python virtual environment exists
if not exist "venv" (
    echo ❌ Virtual environment not found. Please run setup first.
    echo Run: python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt
    pause
    exit /b 1
)

REM Check if fallback_backend.py exists
if not exist "fallback_backend.py" (
    echo ❌ fallback_backend.py not found.
    pause
    exit /b 1
)

REM Activate virtual environment
echo 📦 Activating virtual environment...
call venv\Scripts\activate.bat

REM Start the fallback backend
echo 🛡️  Starting NIS Protocol Fallback Backend on port 8003...
echo 📡 LIDAR processing enabled
echo 🔬 Real IKRP integration active
echo 💡 This serves as a reliable fallback when Docker services are unavailable
echo.
echo Access the fallback backend at: http://localhost:8003
echo Health check: http://localhost:8003/system/health
echo.
echo Press Ctrl+C to stop the fallback backend
echo.

REM Run the fallback backend
python fallback_backend.py

pause 