@echo off
echo ========================================
echo 🔍 Demo Status Check
echo ========================================
echo.

echo Checking Backend (localhost:8000)...
curl -s -o nul -w "Backend Status: %%{http_code}\n" http://localhost:8000/system/health 2>nul || echo Backend Status: OFFLINE

echo.
echo Checking Frontend (localhost:3000)...
curl -s -o nul -w "Frontend Status: %%{http_code}\n" http://localhost:3000 2>nul || echo Frontend Status: OFFLINE

echo.
echo Checking for ngrok.exe...
if exist ngrok.exe (
    echo ngrok.exe: ✅ READY
) else (
    echo ngrok.exe: ❌ NOT FOUND - Run setup_ngrok_demo.bat first
)

echo.
echo ========================================
echo 🎯 Quick Start Commands
echo ========================================
echo.
echo 1. Double-click: setup_ngrok_demo.bat      (if ngrok not ready)
echo 2. Double-click: start_frontend_demo.bat   (starts frontend)
echo 3. Double-click: start_ngrok_demo.bat      (creates public URL)
echo.
echo Your Docker containers should already be running!
echo.
pause 