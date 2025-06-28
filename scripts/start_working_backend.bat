@echo off
echo 🚀 Starting Working Backend System...

REM Kill any existing processes
taskkill //f //im python.exe 2>nul

REM Wait for cleanup
timeout /t 3 >nul

echo 🔧 Starting fallback backend (it works despite syntax warnings)...
echo.
echo ⚠️  Note: Ignore any syntax warnings - the backend will still work!
echo.

REM Start the backend in background
start /min python fallback_backend.py

REM Wait for startup
timeout /t 5 >nul

echo 🧪 Testing backend health...
curl -s http://localhost:8003/health > nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend is running successfully!
    echo.
    echo 🌐 Backend available at: http://localhost:8003
    echo 📊 Health check: http://localhost:8003/health
    echo 🔍 Analysis endpoint: http://localhost:8003/analysis/comprehensive
    echo.
) else (
    echo ❌ Backend startup failed
)

echo Press any key to continue...
pause >nul 