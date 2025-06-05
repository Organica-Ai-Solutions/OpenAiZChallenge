@echo off
setlocal enabledelayedexpansion

REM ================================================================================================
REM NIS PROTOCOL - Quick Start Script (Enhanced Version)
REM Advanced Archaeological Discovery Platform
REM ================================================================================================

REM --- Color codes for enhanced output ---
set "GREEN=[92m"
set "YELLOW=[93m" 
set "BLUE=[94m"
set "CYAN=[96m"
set "RED=[91m"
set "MAGENTA=[95m"
set "RESET=[0m"

REM --- Configuration ---
set "BASE_DIR=%~dp0"
set "LOG_DIR=%BASE_DIR%logs"
set "FRONTEND_DIR=%BASE_DIR%frontend"
set "VENV_DIR=%BASE_DIR%venv"

REM --- Create logs directory ---
if not exist "%LOG_DIR%" (
    mkdir "%LOG_DIR%"
)

REM --- Welcome Banner ---
echo.
echo %CYAN%^<====================================================================================^>%RESET%
echo %CYAN%^|                                                                                    ^|%RESET%
echo %CYAN%^|          🚀  NIS PROTOCOL - Quick Start  ⚡                                      ^|%RESET%
echo %CYAN%^|                                                                                    ^|%RESET%
echo %CYAN%^|   Archaeological Discovery Platform - Rapid Deployment                            ^|%RESET%
echo %CYAN%^|                                                                                    ^|%RESET%
echo %CYAN%^<====================================================================================^>%RESET%
echo.

echo %GREEN%Starting NIS Protocol Application...%RESET%
echo.

REM --- System Check ---
echo %BLUE%🔍 Performing quick system check...%RESET%

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%❌ Python not found. Please install Python 3.8+%RESET%
    echo    Download from: https://www.python.org/downloads/
    goto :requirements_error
)
echo %GREEN%✅ Python found%RESET%

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%❌ Node.js not found. Please install Node.js 18+%RESET%
    echo    Download from: https://nodejs.org/
    goto :requirements_error
)
echo %GREEN%✅ Node.js found%RESET%

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%❌ npm not found%RESET%
    goto :requirements_error
)
echo %GREEN%✅ npm found%RESET%

echo.
echo %BLUE%🛠️ Setting up development environment...%RESET%

REM --- Navigate to base directory ---
cd /D "%BASE_DIR%"

REM --- Create and setup virtual environment ---
if not exist "%VENV_DIR%" (
    echo %CYAN%📦 Creating Python virtual environment...%RESET%
    python -m venv "%VENV_DIR%"
    if %errorlevel% neq 0 (
        echo %RED%❌ Failed to create virtual environment%RESET%
        goto :error_exit
    )
    echo %GREEN%✅ Virtual environment created%RESET%
) else (
    echo %GREEN%✅ Virtual environment already exists%RESET%
)

REM --- Activate virtual environment ---
echo %CYAN%🔧 Activating virtual environment...%RESET%
call "%VENV_DIR%\Scripts\activate.bat"

REM --- Install Python dependencies ---
echo %CYAN%📚 Installing Python dependencies...%RESET%
pip install -r requirements.txt >nul 2>&1
if %errorlevel% neq 0 (
    echo %YELLOW%⚠️ Some Python dependencies may have issues. Continuing...%RESET%
) else (
    echo %GREEN%✅ Python dependencies installed%RESET%
)

REM --- Setup frontend ---
cd /D "%FRONTEND_DIR%"
if not exist "node_modules" (
    echo %CYAN%📦 Installing frontend dependencies...%RESET%
    npm install >nul 2>&1
    if %errorlevel% neq 0 (
        echo %YELLOW%⚠️ Some frontend dependencies may have issues. Continuing...%RESET%
    ) else (
        echo %GREEN%✅ Frontend dependencies installed%RESET%
    )
) else (
    echo %GREEN%✅ Frontend dependencies already installed%RESET%
)

REM --- Start services ---
echo.
echo %BLUE%🚀 Starting NIS Protocol services...%RESET%
echo.

cd /D "%BASE_DIR%"

REM --- Start Backend Server ---
echo %CYAN%🔧 Starting Backend API Server...%RESET%
start "NIS Protocol Backend" cmd /k "title NIS Backend Server && call venv\Scripts\activate.bat && echo Starting NIS Protocol Backend on http://localhost:8000 && echo. && python backend_main.py"

REM --- Wait a moment for backend to start ---
timeout /t 3 /nobreak >nul

REM --- Start Frontend Server ---
echo %CYAN%🎨 Starting Frontend Development Server...%RESET%
cd /D "%FRONTEND_DIR%"
start "NIS Protocol Frontend" cmd /k "title NIS Frontend Server && echo Starting NIS Protocol Frontend on http://localhost:3000 && echo. && npm run dev"

REM --- Success message ---
echo.
echo %GREEN%^<====================================================================================^>%RESET%
echo %GREEN%^|                                                                                    ^|%RESET%
echo %GREEN%^|          ✅  NIS PROTOCOL SERVICES STARTING SUCCESSFULLY  🎉                     ^|%RESET%
echo %GREEN%^|                                                                                    ^|%RESET%
echo %GREEN%^<====================================================================================^>%RESET%
echo.

echo %CYAN%🌐 Backend API Server:%RESET%      %BLUE%http://localhost:8000%RESET%
echo %CYAN%🎨 Frontend Application:%RESET%    %BLUE%http://localhost:3000%RESET%
echo.
echo %CYAN%📊 Available Pages:%RESET%
echo %BLUE%   • Main Dashboard:        http://localhost:3000%RESET%
echo %BLUE%   • Agent Interface:       http://localhost:3000/agent%RESET%
echo %BLUE%   • Interactive Map:       http://localhost:3000/map%RESET%
echo %BLUE%   • Analytics Dashboard:   http://localhost:3000/analytics%RESET%
echo %BLUE%   • AI Chat System:        http://localhost:3000/chat%RESET%
echo %BLUE%   • Vision Analysis:       http://localhost:3000/vision-analysis%RESET%
echo %BLUE%   • Satellite Imagery:     http://localhost:3000/satellite%RESET%
echo %BLUE%   • Documentation:         http://localhost:3000/documentation%RESET%
echo.

echo %YELLOW%📋 Quick Start Guide:%RESET%
echo %CYAN%   1. Wait 30-60 seconds for services to fully initialize%RESET%
echo %CYAN%   2. Open your browser to http://localhost:3000%RESET%
echo %CYAN%   3. Navigate to the Agent tab for archaeological analysis%RESET%
echo %CYAN%   4. Use the Map tab for interactive site discovery%RESET%
echo %CYAN%   5. Check the Chat tab for AI-assisted research%RESET%
echo.

echo %BLUE%🛠️ Management Commands:%RESET%
echo %CYAN%   • View backend logs:     Check "NIS Protocol Backend" window%RESET%
echo %CYAN%   • View frontend logs:    Check "NIS Protocol Frontend" window%RESET%
echo %CYAN%   • Stop all services:     Run stop.bat%RESET%
echo %CYAN%   • Restart services:      Close windows and run this script again%RESET%
echo.

echo %GREEN%🎯 System Status:%RESET%
echo %CYAN%   • Backend:  Starting on port 8000%RESET%
echo %CYAN%   • Frontend: Starting on port 3000%RESET%
echo %CYAN%   • Mode:     Local Development%RESET%
echo %CYAN%   • Environment: Windows%RESET%
echo.

echo %MAGENTA%💡 Tips:%RESET%
echo %CYAN%   • Keep both command windows open while using the application%RESET%
echo %CYAN%   • The first startup may take longer due to dependency installation%RESET%
echo %CYAN%   • For Docker deployment, use start.bat instead%RESET%
echo %CYAN%   • Check logs/ directory for detailed system logs%RESET%
echo.

REM --- Wait for user confirmation ---
echo %BLUE%Press any key to close this setup window (services will continue running)...%RESET%
pause >nul

goto :end

:requirements_error
echo.
echo %RED%❌ Missing Requirements:%RESET%
echo.
echo %BLUE%Please install the required software:%RESET%
echo %CYAN%1. Python 3.8 or later:  https://www.python.org/downloads/%RESET%
echo %CYAN%2. Node.js 18 or later:   https://nodejs.org/%RESET%
echo.
echo %BLUE%After installation, restart your command prompt and run this script again.%RESET%
goto :end

:error_exit
echo.
echo %RED%❌ Setup failed. Please check the error messages above.%RESET%
echo.
echo %BLUE%For troubleshooting:%RESET%
echo %CYAN%• Check STARTUP_GUIDE.md%RESET%
echo %CYAN%• Ensure Python and Node.js are properly installed%RESET%
echo %CYAN%• Try running start.bat for Docker-based setup%RESET%
echo.

:end
echo.
echo %BLUE%Press any key to exit...%RESET%
pause >nul
endlocal 