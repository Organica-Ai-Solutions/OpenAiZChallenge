@echo off
echo 🔍 Checking NIS Protocol System Status...
echo.

echo 📊 Checking Backend Services:
echo.

echo 🔗 Testing Main Backend (Port 8000)...
curl -s http://localhost:8000/system/health >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Main Backend: ONLINE
) else (
    echo ❌ Main Backend: OFFLINE
)

echo 🔗 Testing Fallback Backend (Port 8003)...
curl -s http://localhost:8003/health >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Fallback Backend: ONLINE
) else (
    echo ❌ Fallback Backend: OFFLINE
)

echo 🔗 Testing Storage Backend (Port 8004)...
curl -s http://localhost:8004/storage/stats >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Storage Backend: ONLINE
) else (
    echo ❌ Storage Backend: OFFLINE
)

echo 🔗 Testing Frontend (Port 3000)...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Frontend: ONLINE
) else (
    echo ❌ Frontend: OFFLINE
)

echo.
echo 🎯 Quick Fix for Fetch Errors:
echo 1. If backends are offline, run: scripts\start_comprehensive_system.bat
echo 2. If frontend is offline, run: cd frontend && npm run dev
echo 3. If still having issues, try: taskkill /F /IM node.exe && taskkill /F /IM python.exe
echo.

pause 