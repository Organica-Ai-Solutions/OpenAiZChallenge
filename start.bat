@echo off
setlocal enabledelayedexpansion

REM ================================================================================================
REM NIS PROTOCOL - Windows Startup Script (Enhanced Version)
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
set "TIMESTAMP_FORMAT=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "START_LOG_FILE=%LOG_DIR%\nis_startup_bat_%TIMESTAMP_FORMAT%.log"
set "ERROR_LOG_FILE=%LOG_DIR%\nis_startup_bat_error_%TIMESTAMP_FORMAT%.log"

REM --- Create logs directory ---
if not exist "%LOG_DIR%" (
    mkdir "%LOG_DIR%"
    echo %GREEN%[INFO] Created log directory: %LOG_DIR%%RESET%
)

REM --- Enhanced logging functions ---
:log_message
echo %GREEN%[%~1] [%date% %time%] %~2%RESET%
echo [%~1] [%date% %time%] %~2 >> "%START_LOG_FILE%"
goto :eof

:log_warning
echo %YELLOW%[WARNING] [%date% %time%] %~1%RESET%
echo [WARNING] [%date% %time%] %~1 >> "%START_LOG_FILE%"
goto :eof

:log_error
echo %RED%[ERROR] [%date% %time%] %~1%RESET%
echo [ERROR] [%date% %time%] %~1 >> "%ERROR_LOG_FILE%"
goto :eof

:log_success
echo %GREEN%[SUCCESS] [%date% %time%] %~1%RESET%
echo [SUCCESS] [%date% %time%] %~1 >> "%START_LOG_FILE%"
goto :eof

REM --- Welcome Banner ---
echo.
echo %CYAN%^<====================================================================================^>%RESET%
echo %CYAN%^|                                                                                    ^|%RESET%
echo %CYAN%^|          🏛️  NIS PROTOCOL - Archaeological Discovery Platform  🔬               ^|%RESET%
echo %CYAN%^|                                                                                    ^|%RESET%
echo %CYAN%^|   Multi-Agent Intelligence ^| Real-Time Analysis ^| Historical Discovery         ^|%RESET%
echo %CYAN%^|   Google Maps Integration ^| GPT-4 Vision ^| LIDAR Processing                     ^|%RESET%
echo %CYAN%^|                                                                                    ^|%RESET%
echo %CYAN%^<====================================================================================^>%RESET%
echo.

call :log_message INFO "NIS Protocol Windows Startup Script Initialized"

REM --- System Compatibility Check ---
call :log_message INFO "Performing system compatibility check..."

REM Check for required tools
python --version >nul 2>&1
if %errorlevel% neq 0 (
    call :log_error "Python is not installed or not in PATH. Please install Python 3.8 or later."
    goto :show_requirements
)
call :log_success "Python found"

node --version >nul 2>&1
if %errorlevel% neq 0 (
    call :log_error "Node.js is not installed or not in PATH. Please install Node.js 18 or later."
    goto :show_requirements
)
call :log_success "Node.js found"

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    call :log_error "npm is not installed or not in PATH. It should come with Node.js."
    goto :show_requirements
)
call :log_success "npm found"

REM Check for Docker (optional)
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    call :log_warning "Docker not found. Will use local development mode."
    set "DOCKER_AVAILABLE=false"
) else (
    call :log_success "Docker found"
    set "DOCKER_AVAILABLE=true"
    
    REM Check if Docker daemon is running
    docker info >nul 2>&1
    if %errorlevel% neq 0 (
        call :log_warning "Docker daemon is not running. Will use local development mode."
        set "DOCKER_AVAILABLE=false"
    ) else (
        call :log_success "Docker daemon is running"
        
        REM Check for Docker Compose
        docker-compose --version >nul 2>&1
        if %errorlevel% neq 0 (
            call :log_warning "Docker Compose not found. Will use local development mode."
            set "DOCKER_AVAILABLE=false"
        ) else (
            call :log_success "Docker Compose found"
        fi
    fi
)

REM --- Choose startup mode ---
echo.
echo %BLUE%Available startup modes:%RESET%
echo %CYAN%1. Docker Mode (Recommended)%RESET% - Full containerized environment
echo %CYAN%2. Local Development Mode%RESET% - Run services directly on your machine
echo %CYAN%3. Frontend Only Mode%RESET% - Start only the frontend (for development)
echo.

if "%DOCKER_AVAILABLE%"=="true" (
    echo %GREEN%Docker is available. Recommended mode: Docker Mode%RESET%
    set /p "MODE=Enter your choice (1-3, default 1): "
    if "!MODE!"=="" set "MODE=1"
) else (
    echo %YELLOW%Docker not available. Using Local Development Mode.%RESET%
    set "MODE=2"
)

REM --- Navigate to base directory ---
cd /D "%BASE_DIR%"

REM --- Execute based on selected mode ---
if "%MODE%"=="1" goto :docker_mode
if "%MODE%"=="2" goto :local_mode
if "%MODE%"=="3" goto :frontend_mode
goto :invalid_choice

:docker_mode
call :log_message INFO "Starting NIS Protocol in Docker Mode..."

REM Stop any existing services
call :log_message INFO "Stopping any existing services..."
docker-compose down --remove-orphans >> "%START_LOG_FILE%" 2>> "%ERROR_LOG_FILE%"

REM Build and start services
call :log_message INFO "Building and starting services with Docker Compose..."
docker-compose up --build -d >> "%START_LOG_FILE%" 2>> "%ERROR_LOG_FILE%"

if %errorlevel% equ 0 (
    call :log_success "NIS Protocol services are starting in Docker mode!"
    echo.
    echo %GREEN%✅ Services are starting up...%RESET%
    echo %CYAN%🌐 Backend API: http://localhost:8000%RESET%
    echo %CYAN%🎨 Frontend UI: http://localhost:3000%RESET%
    echo %CYAN%📊 Analytics: http://localhost:3000/analytics%RESET%
    echo %CYAN%🗺️ Interactive Map: http://localhost:3000/map%RESET%
    echo %CYAN%💬 AI Chat: http://localhost:3000/chat%RESET%
    echo.
    echo %BLUE%Useful commands:%RESET%
    echo   docker-compose logs -f     (view live logs)
    echo   docker-compose ps          (check service status)
    echo   stop.bat                   (stop all services)
    echo.
    
    REM Wait for services to start
    call :log_message INFO "Waiting for services to initialize..."
    timeout /t 10 /nobreak >nul
    
    REM Check service health
    call :check_service_health
    
) else (
    call :log_error "Failed to start services with Docker Compose"
    goto :error_exit
)
goto :end

:local_mode
call :log_message INFO "Starting NIS Protocol in Local Development Mode..."

REM Create virtual environment if it doesn't exist
if not exist "%VENV_DIR%" (
    call :log_message INFO "Creating Python virtual environment..."
    python -m venv "%VENV_DIR%" >> "%START_LOG_FILE%" 2>> "%ERROR_LOG_FILE%"
    if %errorlevel% neq 0 (
        call :log_error "Failed to create virtual environment"
        goto :error_exit
    )
    call :log_success "Virtual environment created"
)

REM Activate virtual environment
call :log_message INFO "Activating virtual environment..."
call "%VENV_DIR%\Scripts\activate.bat"

REM Install Python dependencies
call :log_message INFO "Installing Python dependencies..."
pip install -r requirements.txt >> "%START_LOG_FILE%" 2>> "%ERROR_LOG_FILE%"
if %errorlevel% neq 0 (
    call :log_error "Failed to install Python dependencies"
    goto :error_exit
)

REM Install frontend dependencies
call :log_message INFO "Installing frontend dependencies..."
cd /D "%FRONTEND_DIR%"
npm install >> "%START_LOG_FILE%" 2>> "%ERROR_LOG_FILE%"
if %errorlevel% neq 0 (
    call :log_error "Failed to install frontend dependencies"
    goto :error_exit
)

REM Start backend server
cd /D "%BASE_DIR%"
call :log_message INFO "Starting backend server..."
start "NIS Backend" cmd /k "call venv\Scripts\activate.bat && python backend_main.py"

REM Start frontend server
call :log_message INFO "Starting frontend server..."
cd /D "%FRONTEND_DIR%"
start "NIS Frontend" cmd /k "npm run dev"

call :log_success "NIS Protocol services are starting in Local Development Mode!"
echo.
echo %GREEN%✅ Services are starting up...%RESET%
echo %CYAN%🌐 Backend API: http://localhost:8000%RESET%
echo %CYAN%🎨 Frontend UI: http://localhost:3000%RESET%
echo.
echo %BLUE%Note: Two command windows will open for backend and frontend servers.%RESET%
echo %BLUE%Close those windows to stop the services.%RESET%

goto :end

:frontend_mode
call :log_message INFO "Starting NIS Protocol in Frontend Only Mode..."

REM Install frontend dependencies
cd /D "%FRONTEND_DIR%"
call :log_message INFO "Installing frontend dependencies..."
npm install >> "%START_LOG_FILE%" 2>> "%ERROR_LOG_FILE%"
if %errorlevel% neq 0 (
    call :log_error "Failed to install frontend dependencies"
    goto :error_exit
)

REM Start frontend server
call :log_message INFO "Starting frontend server..."
start "NIS Frontend" cmd /k "npm run dev"

call :log_success "NIS Protocol frontend is starting!"
echo.
echo %GREEN%✅ Frontend is starting up...%RESET%
echo %CYAN%🎨 Frontend UI: http://localhost:3000%RESET%
echo.
echo %YELLOW%Note: Backend is not running. Some features may not work.%RESET%
echo %BLUE%To start the full system, use Docker Mode or Local Development Mode.%RESET%

goto :end

:check_service_health
call :log_message INFO "Checking service health..."

REM Check backend health
curl -s http://localhost:8000/system/health >nul 2>&1
if %errorlevel% equ 0 (
    call :log_success "Backend is responding"
) else (
    call :log_warning "Backend may still be starting up"
)

REM Check frontend
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    call :log_success "Frontend is responding"
) else (
    call :log_warning "Frontend may still be starting up"
)

goto :eof

:show_requirements
echo.
echo %RED%❌ Missing Requirements:%RESET%
echo.
echo %BLUE%Please install the following before running NIS Protocol:%RESET%
echo.
echo %CYAN%1. Python 3.8 or later:%RESET%
echo    Download from: https://www.python.org/downloads/
echo.
echo %CYAN%2. Node.js 18 or later:%RESET%
echo    Download from: https://nodejs.org/
echo.
echo %CYAN%3. Docker Desktop (optional but recommended):%RESET%
echo    Download from: https://www.docker.com/products/docker-desktop/
echo.
echo %CYAN%4. Git (for version control):%RESET%
echo    Download from: https://git-scm.com/downloads
echo.
echo %BLUE%After installing these tools, restart your command prompt and run this script again.%RESET%
goto :end

:invalid_choice
call :log_error "Invalid choice. Please run the script again and select 1, 2, or 3."
goto :end

:error_exit
echo.
echo %RED%❌ Startup failed. Check the logs for details:%RESET%
echo %CYAN%📄 Startup Log: %START_LOG_FILE%%RESET%
echo %CYAN%📄 Error Log: %ERROR_LOG_FILE%%RESET%
echo.
echo %BLUE%For troubleshooting help, check the documentation:%RESET%
echo %CYAN%📚 STARTUP_GUIDE.md%RESET%
echo %CYAN%📚 README.md%RESET%
goto :end

:end
echo.
call :log_message INFO "Startup script completed"
echo %BLUE%Press any key to close this window...%RESET%
pause >nul
endlocal 