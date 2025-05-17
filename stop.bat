@echo off
SETLOCAL EnableDelayedExpansion

:: Stop script for the NIS Protocol project

echo Stopping all services...

:: Stop the API server
FOR /F "tokens=2" %%A IN ('tasklist /FI "IMAGENAME eq python.exe" /FI "WINDOWTITLE eq run_api.py" /NH') DO (
    echo Stopping API server...
    taskkill /PID %%A /F >nul 2>&1
)
timeout /t 2 /nobreak >nul

:: Stop the frontend
FOR /F "tokens=2" %%A IN ('tasklist /FI "IMAGENAME eq node.exe" /NH') DO (
    echo Stopping frontend...
    taskkill /PID %%A /F >nul 2>&1
)
timeout /t 2 /nobreak >nul

:: Stop Kafka
echo Stopping Kafka...
call kafka-server-stop.bat
timeout /t 3 /nobreak >nul

:: Stop Zookeeper
echo Stopping Zookeeper...
call zookeeper-server-stop.bat
timeout /t 2 /nobreak >nul

:: Stop Redis
echo Stopping Redis...
redis-cli shutdown
timeout /t 1 /nobreak >nul

:: Verify all services are stopped
echo Verifying all services are stopped...
timeout /t 2 /nobreak >nul

SET SERVICES_RUNNING=false

:: Check if services are still running
FOR /F "tokens=1" %%A IN ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') DO (
    echo Warning: API server is still running on port 8000
    SET SERVICES_RUNNING=true
)

FOR /F "tokens=1" %%A IN ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') DO (
    echo Warning: Frontend is still running on port 3000
    SET SERVICES_RUNNING=true
)

FOR /F "tokens=1" %%A IN ('netstat -ano ^| findstr ":9092" ^| findstr "LISTENING"') DO (
    echo Warning: Kafka is still running on port 9092
    SET SERVICES_RUNNING=true
)

FOR /F "tokens=1" %%A IN ('netstat -ano ^| findstr ":2181" ^| findstr "LISTENING"') DO (
    echo Warning: Zookeeper is still running on port 2181
    SET SERVICES_RUNNING=true
)

FOR /F "tokens=1" %%A IN ('netstat -ano ^| findstr ":6379" ^| findstr "LISTENING"') DO (
    echo Warning: Redis is still running on port 6379
    SET SERVICES_RUNNING=true
)

if "!SERVICES_RUNNING!"=="true" (
    echo Some services are still running. You may need to stop them manually.
) else (
    echo All services stopped successfully!
) 