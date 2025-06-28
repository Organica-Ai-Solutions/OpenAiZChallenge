@echo off
echo 🚀 Starting REAL Backend with Enhanced Analysis...

REM Kill any existing backend processes
taskkill /f /im python.exe 2>nul

REM Wait a moment for cleanup
timeout /t 2 >nul

echo 🔧 Starting backend with real analysis (not hardcoded)...
python backend_main.py

pause 