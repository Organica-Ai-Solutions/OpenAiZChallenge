@echo off
SETLOCAL EnableDelayedExpansion

REM Start script for the NIS Protocol project

REM Function to check if a port is in use
FOR /F "tokens=1" %%A IN ('netstat -ano ^| findstr ":6379" ^| findstr "LISTENING"') DO (
    SET REDIS_RUNNING=true
)
FOR /F "tokens=1" %%A IN ('netstat -ano ^| findstr ":2181" ^| findstr "LISTENING"') DO (
    SET ZOOKEEPER_RUNNING=true
)
FOR /F "tokens=1" %%A IN ('netstat -ano ^| findstr ":9092" ^| findstr "LISTENING"') DO (
    SET KAFKA_RUNNING=true
)
FOR /F "tokens=1" %%A IN ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') DO (
    SET FRONTEND_RUNNING=true
)

REM Create necessary directories
echo Creating necessary directories...
mkdir data\lidar 2>nul
mkdir data\satellite 2>nul
mkdir data\colonial_texts 2>nul
mkdir data\overlays 2>nul
mkdir outputs\findings 2>nul
mkdir outputs\logs 2>nul
mkdir outputs\memory 2>nul

REM Check for required commands
echo Checking required commands...
where redis-server >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Redis is not installed. Install with: scoop install redis
    exit /b 1
)

where kafka-server-start.bat >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Kafka is not installed. Install with: scoop install kafka
    exit /b 1
)

where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: npm is not installed. Install with: scoop install nodejs
    exit /b 1
)

REM Set Kafka config paths for Windows
SET KAFKA_CONFIG_DIR=%KAFKA_HOME%\config
if not exist "%KAFKA_CONFIG_DIR%\server.properties" (
    echo Error: Kafka configuration not found at %KAFKA_CONFIG_DIR%
    exit /b 1
)

REM Setup Python environment
echo Setting up Python environment...
if exist "venv" (
    echo Removing existing virtual environment...
    rmdir /s /q venv
)

echo Creating new virtual environment...
python -m venv venv
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to create virtual environment
    exit /b 1
)

call venv\Scripts\activate.bat
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to activate virtual environment
    exit /b 1
)

echo Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install Python dependencies
    exit /b 1
)

REM Start Redis Server (if not running)
if not defined REDIS_RUNNING (
    echo Starting Redis Server...
    start /B redis-server
    timeout /t 2 /nobreak >nul
) else (
    echo Redis Server is already running
)

REM Start Zookeeper (if not running)
if not defined ZOOKEEPER_RUNNING (
    echo Starting Zookeeper...
    start /B zookeeper-server-start.bat "%KAFKA_CONFIG_DIR%\zookeeper.properties"
    timeout /t 5 /nobreak >nul
) else (
    echo Zookeeper is already running
)

REM Start Kafka (if not running)
if not defined KAFKA_RUNNING (
    echo Starting Kafka Server...
    start /B kafka-server-start.bat "%KAFKA_CONFIG_DIR%\server.properties"
    timeout /t 5 /nobreak >nul
) else (
    echo Kafka Server is already running
)

REM Check if frontend directory exists
if not exist "frontend" (
    echo Error: Frontend directory not found
    exit /b 1
)

REM Start Frontend (if not running)
if not defined FRONTEND_RUNNING (
    echo Starting Frontend...
    cd frontend
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to install frontend dependencies
        exit /b 1
    )
    start /B npm start
    cd ..
    timeout /t 5 /nobreak >nul
) else (
    echo Frontend is already running on port 3000
)

REM Start the API server
echo Starting NIS Protocol API server...
start /B python run_api.py

REM Wait for services to be ready
echo Waiting for services to start...
timeout /t 5 /nobreak >nul

echo All services started successfully!
echo Frontend running on: http://localhost:3000
echo Backend API running on: http://localhost:8000
echo Redis running on: localhost:6379
echo Kafka running on: localhost:9092
echo.
echo To stop all services, run: stop.bat 