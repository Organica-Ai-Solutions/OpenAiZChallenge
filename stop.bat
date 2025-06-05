@echo off
setlocal enabledelayedexpansion

REM ================================================================================================
REM NIS PROTOCOL - Windows Shutdown Script (Enhanced Version)
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
set "TIMESTAMP_FORMAT=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "STOP_LOG_FILE=%LOG_DIR%\nis_stop_bat_%TIMESTAMP_FORMAT%.log"
set "ERROR_LOG_FILE=%LOG_DIR%\nis_stop_bat_error_%TIMESTAMP_FORMAT%.log"

REM --- Create logs directory (if it doesn't exist) ---
if not exist "%LOG_DIR%" (
    mkdir "%LOG_DIR%"
    echo %GREEN%[INFO] Created log directory: %LOG_DIR%%RESET%
)

REM --- Enhanced logging functions ---
:log_message
echo %GREEN%[%~1] [%date% %time%] %~2%RESET%
echo [%~1] [%date% %time%] %~2 >> "%STOP_LOG_FILE%"
goto :eof

:log_warning
echo %YELLOW%[WARNING] [%date% %time%] %~1%RESET%
echo [WARNING] [%date% %time%] %~1 >> "%STOP_LOG_FILE%"
goto :eof

:log_error
echo %RED%[ERROR] [%date% %time%] %~1%RESET%
echo [ERROR] [%date% %time%] %~1 >> "%ERROR_LOG_FILE%"
goto :eof

:log_success
echo %GREEN%[SUCCESS] [%date% %time%] %~1%RESET%
echo [SUCCESS] [%date% %time%] %~1 >> "%STOP_LOG_FILE%"
goto :eof

REM --- Welcome Banner ---
echo.
echo %CYAN%^<====================================================================================^>%RESET%
echo %CYAN%^|                                                                                    ^|%RESET%
echo %CYAN%^|          🛑  NIS PROTOCOL - Shutdown Script  🔧                                 ^|%RESET%
echo %CYAN%^|                                                                                    ^|%RESET%
echo %CYAN%^|   Gracefully stopping all NIS Protocol services                                  ^|%RESET%
echo %CYAN%^|                                                                                    ^|%RESET%
echo %CYAN%^<====================================================================================^>%RESET%
echo.

call :log_message INFO "NIS Protocol Windows Shutdown Script Initialized"

REM --- Navigate to script's directory (important for docker-compose) ---
cd /D "%BASE_DIR%"

REM --- Check for Docker and Docker Compose ---
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    call :log_warning "Docker not found. Will only stop local processes."
    set "DOCKER_AVAILABLE=false"
) else (
    call :log_success "Docker found"
    set "DOCKER_AVAILABLE=true"
    
    docker-compose --version >nul 2>&1
    if %errorlevel% neq 0 (
        call :log_warning "Docker Compose not found. Will only stop local Docker containers."
        set "DOCKER_COMPOSE_AVAILABLE=false"
    ) else (
        call :log_success "Docker Compose found"
        set "DOCKER_COMPOSE_AVAILABLE=true"
    )
)

echo.
echo %BLUE%Shutdown Options:%RESET%
echo %CYAN%1. Full Shutdown%RESET% - Stop Docker services and local processes
echo %CYAN%2. Docker Only%RESET% - Stop only Docker services
echo %CYAN%3. Local Processes Only%RESET% - Stop only local Node.js and Python processes
echo %CYAN%4. Force Shutdown%RESET% - Aggressive shutdown of all NIS-related processes
echo.

set /p "MODE=Enter your choice (1-4, default 1): "
if "%MODE%"=="" set "MODE=1"

REM --- Execute based on selected mode ---
if "%MODE%"=="1" goto :full_shutdown
if "%MODE%"=="2" goto :docker_shutdown
if "%MODE%"=="3" goto :local_shutdown
if "%MODE%"=="4" goto :force_shutdown
goto :invalid_choice

:full_shutdown
call :log_message INFO "Performing full shutdown..."

REM Stop Docker services first
if "%DOCKER_COMPOSE_AVAILABLE%"=="true" (
    call :docker_shutdown_internal
)

REM Stop local processes
call :local_shutdown_internal

call :log_success "Full shutdown completed!"
goto :end

:docker_shutdown
call :log_message INFO "Stopping Docker services only..."
call :docker_shutdown_internal
goto :end

:local_shutdown
call :log_message INFO "Stopping local processes only..."
call :local_shutdown_internal
goto :end

:force_shutdown
call :log_message INFO "Performing force shutdown..."

REM Force stop Docker services
if "%DOCKER_COMPOSE_AVAILABLE%"=="true" (
    call :log_message INFO "Force stopping Docker services..."
    docker-compose kill >> "%STOP_LOG_FILE%" 2>> "%ERROR_LOG_FILE%"
    docker-compose down --remove-orphans --volumes >> "%STOP_LOG_FILE%" 2>> "%ERROR_LOG_FILE%"
)

REM Force kill all related processes
call :log_message INFO "Force killing all NIS-related processes..."
taskkill /f /im node.exe /t >nul 2>&1
taskkill /f /im python.exe /t >nul 2>&1
taskkill /f /im pythonw.exe /t >nul 2>&1

REM Clean up any remaining Docker containers
if "%DOCKER_AVAILABLE%"=="true" (
    call :log_message INFO "Cleaning up Docker containers..."
    for /f "tokens=*" %%i in ('docker ps -aq --filter "name=nis"') do (
        docker stop %%i >nul 2>&1
        docker rm %%i >nul 2>&1
    )
)

call :log_success "Force shutdown completed!"
goto :end

:docker_shutdown_internal
call :log_message INFO "Stopping NIS Protocol Docker services..."

docker-compose down --remove-orphans >> "%STOP_LOG_FILE%" 2>> "%ERROR_LOG_FILE%"

if %errorlevel% equ 0 (
    call :log_success "Docker services stopped successfully"
    
    REM Check if containers are actually stopped
    for /f "tokens=*" %%i in ('docker ps --filter "name=nis" --format "{{.Names}}"') do (
        call :log_warning "Container still running: %%i"
        docker stop %%i >> "%STOP_LOG_FILE%" 2>> "%ERROR_LOG_FILE%"
    )
    
) else (
    call :log_error "Failed to stop Docker services cleanly"
    
    REM Try to stop individual containers
    call :log_message INFO "Attempting to stop individual containers..."
    for /f "tokens=*" %%i in ('docker ps --filter "name=nis" --format "{{.Names}}"') do (
        call :log_message INFO "Stopping container: %%i"
        docker stop %%i >> "%STOP_LOG_FILE%" 2>> "%ERROR_LOG_FILE%"
    )
)

REM Clean up networks
call :log_message INFO "Cleaning up Docker networks..."
docker network prune -f >> "%STOP_LOG_FILE%" 2>> "%ERROR_LOG_FILE%"

goto :eof

:local_shutdown_internal
call :log_message INFO "Stopping local NIS Protocol processes..."

REM Find and stop Node.js processes running on port 3000
call :log_message INFO "Stopping frontend processes (Node.js on port 3000)..."
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000"') do (
    set "PID=%%a"
    if "!PID!" neq "" (
        call :log_message INFO "Stopping process with PID: !PID!"
        taskkill /f /pid !PID! >nul 2>&1
    )
)

REM Find and stop Python processes running on port 8000
call :log_message INFO "Stopping backend processes (Python on port 8000)..."
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000"') do (
    set "PID=%%a"
    if "!PID!" neq "" (
        call :log_message INFO "Stopping process with PID: !PID!"
        taskkill /f /pid !PID! >nul 2>&1
    )
)

REM Stop any remaining NIS-related processes
call :log_message INFO "Stopping any remaining NIS processes..."
wmic process where "commandline like '%%backend_main.py%%'" delete >nul 2>&1
wmic process where "commandline like '%%npm run dev%%'" delete >nul 2>&1
wmic process where "commandline like '%%next%%'" delete >nul 2>&1

REM Close any open command windows with NIS in the title
call :log_message INFO "Closing NIS-related command windows..."
taskkill /f /fi "WindowTitle eq NIS Backend*" >nul 2>&1
taskkill /f /fi "WindowTitle eq NIS Frontend*" >nul 2>&1

call :log_success "Local processes stopped"
goto :eof

:show_status
call :log_message INFO "Checking service status..."

REM Check Docker containers
if "%DOCKER_AVAILABLE%"=="true" (
    echo.
    echo %BLUE%Docker Containers:%RESET%
    docker ps --filter "name=nis" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo.
)

REM Check local processes
echo %BLUE%Local Processes:%RESET%
echo.
echo %CYAN%Port 3000 (Frontend):%RESET%
netstat -aon | findstr ":3000" | findstr LISTENING
echo.
echo %CYAN%Port 8000 (Backend):%RESET%
netstat -aon | findstr ":8000" | findstr LISTENING
echo.

goto :eof

:invalid_choice
call :log_error "Invalid choice. Please run the script again and select 1, 2, 3, or 4."
goto :end

:end
echo.
call :show_status

echo.
echo %GREEN%✅ Shutdown process completed!%RESET%
echo.
echo %BLUE%Next steps:%RESET%
echo %CYAN%• To restart: run start.bat%RESET%
echo %CYAN%• To check logs: check the logs/ directory%RESET%
echo %CYAN%• For troubleshooting: see STARTUP_GUIDE.md%RESET%
echo.

call :log_message INFO "Shutdown script completed"
echo %BLUE%Press any key to close this window...%RESET%
pause >nul
endlocal 