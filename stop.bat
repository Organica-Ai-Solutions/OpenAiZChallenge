@echo off
setlocal

REM --- Configuration ---
set "BASE_DIR=%~dp0"
set "LOG_DIR=%BASE_DIR%logs"
set "TIMESTAMP_FORMAT=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "STOP_LOG_FILE=%LOG_DIR%\nis_stop_bat_%TIMESTAMP_FORMAT%.log"
set "ERROR_LOG_FILE=%LOG_DIR%\nis_stop_bat_error_%TIMESTAMP_FORMAT%.log"

REM --- Create logs directory (if it doesn't exist) ---
if not exist "%LOG_DIR%" (
    mkdir "%LOG_DIR%"
    echo [INFO] Created log directory: %LOG_DIR%
)

REM --- Helper to echo and log ---
:log_message
echo [%~1] [%date% %time%] %~2
echo [%~1] [%date% %time%] %~2 >> "%STOP_LOG_FILE%"
goto :eof

:log_error
echo [ERROR] [%date% %time%] %~1
echo [ERROR] [%date% %time%] %~1 >> "%ERROR_LOG_FILE%"
goto :eof

call :log_message INFO "NIS Protocol Shutdown Script (stop.bat) Initialized"

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

call :log_message INFO "Stopping NIS Protocol services using Docker Compose..."

docker-compose down --remove-orphans >> "%STOP_LOG_FILE%" 2>> "%ERROR_LOG_FILE%"

if %errorlevel% equ 0 (
    call :log_message SUCCESS "NIS Protocol services stopped and removed successfully."
    echo NIS Protocol services have been shut down.
) else (
    call :log_error "An error occurred while stopping services with Docker Compose. Check %ERROR_LOG_FILE% for details."
    echo [ERROR] Failed to stop services cleanly. See logs for details.
)

call :log_message INFO "View detailed shutdown logs at: %STOP_LOG_FILE%"

endlocal 