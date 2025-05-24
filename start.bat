@echo off
setlocal

REM --- Configuration ---
set "BASE_DIR=%~dp0"
set "LOG_DIR=%BASE_DIR%logs"
set "TIMESTAMP_FORMAT=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "START_LOG_FILE=%LOG_DIR%\nis_startup_bat_%TIMESTAMP_FORMAT%.log"
set "ERROR_LOG_FILE=%LOG_DIR%\nis_startup_bat_error_%TIMESTAMP_FORMAT%.log"

REM --- Create logs directory ---
if not exist "%LOG_DIR%" (
    mkdir "%LOG_DIR%"
    echo [INFO] Created log directory: %LOG_DIR%
)

REM --- Logging function placeholder (batch file logging is less direct) ---
REM For simplicity, critical messages will be echoed and can be redirected if needed.

REM --- Helper to echo and log ---
:log_message
echo [%~1] [%date% %time%] %~2
echo [%~1] [%date% %time%] %~2 >> "%START_LOG_FILE%"
goto :eof

:log_error
echo [ERROR] [%date% %time%] %~1
echo [ERROR] [%date% %time%] %~1 >> "%ERROR_LOG_FILE%"
goto :eof

call :log_message INFO "NIS Protocol Startup Script (start.bat) Initialized"

REM --- Welcome Banner ---
echo.
echo ^<----------------------------------------------------------------^>
echo ^|                                                                ^|
echo ^|          ZEN NEURAL-INSPIRED SYSTEM PROTOCOL  (NIS)            ^|
echo ^|                                                                ^|
echo ^|   Multi-Agent Intelligence | Geospatial Reasoning             ^|
echo ^|   Interpreting Ancient History with Modern AI                  ^|
echo ^|                                                                ^|
echo ^<----------------------------------------------------------------^>
echo.

call :log_message INFO "Starting NIS Protocol services using Docker Compose..."

REM --- Check for Docker and Docker Compose ---
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    call :log_error "Docker is not installed or not in PATH. Please install Docker Desktop."
    goto :eof
)
call :log_message INFO "Docker found."

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    call :log_error "Docker Compose is not installed or not in PATH. It's included with Docker Desktop."
    goto :eof
)
call :log_message INFO "Docker Compose found."

REM --- Navigate to script's directory (important for docker-compose) ---
cd /D "%BASE_DIR%"

REM --- Stop existing services (optional, but good practice) ---
call :log_message INFO "Attempting to stop any existing NIS services..."
docker-compose down --remove-orphans >> "%START_LOG_FILE%" 2>> "%ERROR_LOG_FILE%"
if %errorlevel% equ 0 (
    call :log_message INFO "Existing services stopped (if any)."
) else (
    call :log_message WARN "Could not stop existing services, or no services were running. Continuing..."
)

REM --- Build and Start services in detached mode ---
call :log_message INFO "Building and starting services with 'docker-compose up --build -d'..."
docker-compose up --build -d >> "%START_LOG_FILE%" 2>> "%ERROR_LOG_FILE%"

if %errorlevel% equ 0 (
    call :log_message SUCCESS "NIS Protocol services are starting in detached mode."
    echo.
    echo NIS Protocol is launching!
    echo   Backend API: http://localhost:8000
    echo   Frontend UI: http://localhost:3000
    echo.
    echo   To view logs: docker-compose logs -f
    echo   To stop services: docker-compose down (or run stop.bat)
    echo.
    call :log_message INFO "View detailed startup logs at: %START_LOG_FILE%"
    call :log_message INFO "View error logs (if any) at: %ERROR_LOG_FILE%"
) else (
    call :log_error "Failed to start services with Docker Compose. Check %ERROR_LOG_FILE% and %START_LOG_FILE% for details."
    echo [ERROR] Failed to start services. See logs for details.
)

endlocal 