@echo off
setlocal enabledelayedexpansion

REM ================================================================================================
REM NIS PROTOCOL - Test Suite Runner (Enhanced Version)
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
set "VENV_DIR=%BASE_DIR%venv"
set "TIMESTAMP_FORMAT=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "TEST_LOG_FILE=%LOG_DIR%\nis_test_%TIMESTAMP_FORMAT%.log"

REM --- Create logs directory ---
if not exist "%LOG_DIR%" (
    mkdir "%LOG_DIR%"
)

REM --- Welcome Banner ---
echo.
echo %CYAN%^<====================================================================================^>%RESET%
echo %CYAN%^|                                                                                    ^|%RESET%
echo %CYAN%^|          🧪  NIS PROTOCOL - Test Suite Runner  ✅                               ^|%RESET%
echo %CYAN%^|                                                                                    ^|%RESET%
echo %CYAN%^|   Comprehensive Testing for Archaeological Discovery Platform                      ^|%RESET%
echo %CYAN%^|                                                                                    ^|%RESET%
echo %CYAN%^<====================================================================================^>%RESET%
echo.

echo %GREEN%NIS Protocol Test Suite Runner%RESET%
echo.

REM --- Check for Python ---
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%❌ Python not found. Please install Python 3.8 or later.%RESET%
    echo    Download from: https://www.python.org/downloads/
    goto :error_exit
)
echo %GREEN%✅ Python found%RESET%

REM --- Check virtual environment ---
if not exist "%VENV_DIR%\Scripts\activate.bat" (
    echo %YELLOW%⚠️ Virtual environment not found. Creating one...%RESET%
    python -m venv "%VENV_DIR%"
    if %errorlevel% neq 0 (
        echo %RED%❌ Failed to create virtual environment%RESET%
        goto :error_exit
    )
    echo %GREEN%✅ Virtual environment created%RESET%
) else (
    echo %GREEN%✅ Virtual environment found%RESET%
)

REM --- Activate virtual environment ---
echo %CYAN%🔧 Activating virtual environment...%RESET%
call "%VENV_DIR%\Scripts\activate.bat"

REM --- Install test dependencies ---
echo %CYAN%📦 Installing test dependencies...%RESET%
pip install -r requirements.txt >nul 2>&1
pip install pytest pytest-asyncio pytest-cov >nul 2>&1

REM --- Test Options ---
echo.
echo %BLUE%Available Test Suites:%RESET%
echo.
echo %CYAN%1. Quick Tests%RESET% - Basic functionality and health checks
echo %CYAN%2. Full Test Suite%RESET% - Complete system testing
echo %CYAN%3. Backend Tests%RESET% - API and data processing tests
echo %CYAN%4. Frontend Tests%RESET% - UI and component tests
echo %CYAN%5. Integration Tests%RESET% - End-to-end testing
echo %CYAN%6. Performance Tests%RESET% - Load and performance testing
echo %CYAN%7. Agent Tests%RESET% - AI agent functionality testing
echo %CYAN%8. Data Tests%RESET% - Data access and processing tests
echo %CYAN%9. Custom Test%RESET% - Run specific test file
echo.

set /p "CHOICE=Enter your choice (1-9, default 1): "
if "%CHOICE%"=="" set "CHOICE=1"

REM --- Navigate to base directory ---
cd /D "%BASE_DIR%"

REM --- Execute tests based on choice ---
if "%CHOICE%"=="1" goto :quick_tests
if "%CHOICE%"=="2" goto :full_tests
if "%CHOICE%"=="3" goto :backend_tests
if "%CHOICE%"=="4" goto :frontend_tests
if "%CHOICE%"=="5" goto :integration_tests
if "%CHOICE%"=="6" goto :performance_tests
if "%CHOICE%"=="7" goto :agent_tests
if "%CHOICE%"=="8" goto :data_tests
if "%CHOICE%"=="9" goto :custom_test
goto :invalid_choice

:quick_tests
echo.
echo %BLUE%🚀 Running Quick Tests...%RESET%
echo.

echo %CYAN%Testing system health...%RESET%
python test_system_health.py 2>&1 | tee -a "%TEST_LOG_FILE%"

echo %CYAN%Testing connections...%RESET%
python test_connections.py 2>&1 | tee -a "%TEST_LOG_FILE%"

echo %CYAN%Testing basic agent functionality...%RESET%
python test_agent_functionality.py 2>&1 | tee -a "%TEST_LOG_FILE%"

goto :test_complete

:full_tests
echo.
echo %BLUE%🔍 Running Full Test Suite...%RESET%
echo.

echo %CYAN%1/8 System Health Tests...%RESET%
python test_system_health.py 2>&1 | tee -a "%TEST_LOG_FILE%"

echo %CYAN%2/8 Connection Tests...%RESET%
python test_connections.py 2>&1 | tee -a "%TEST_LOG_FILE%"

echo %CYAN%3/8 Agent Functionality Tests...%RESET%
python test_agent_functionality.py 2>&1 | tee -a "%TEST_LOG_FILE%"

echo %CYAN%4/8 Satellite System Tests...%RESET%
python test_satellite_system.py 2>&1 | tee -a "%TEST_LOG_FILE%"

echo %CYAN%5/8 Discovery Service Tests...%RESET%
python test_discovery_service.py 2>&1 | tee -a "%TEST_LOG_FILE%"

echo %CYAN%6/8 Chat Integration Tests...%RESET%
python test_chat_real_data.py 2>&1 | tee -a "%TEST_LOG_FILE%"

echo %CYAN%7/8 End-to-End Tests...%RESET%
python test_end_to_end.py 2>&1 | tee -a "%TEST_LOG_FILE%"

echo %CYAN%8/8 Complete Discovery Workflow Tests...%RESET%
python test_complete_discovery_workflow.py 2>&1 | tee -a "%TEST_LOG_FILE%"

goto :test_complete

:backend_tests
echo.
echo %BLUE%🔧 Running Backend Tests...%RESET%
echo.

echo %CYAN%Testing system health...%RESET%
python test_system_health.py 2>&1 | tee -a "%TEST_LOG_FILE%"

echo %CYAN%Testing agent functionality...%RESET%
python test_agent_functionality.py 2>&1 | tee -a "%TEST_LOG_FILE%"

echo %CYAN%Testing discovery service...%RESET%
python test_discovery_service.py 2>&1 | tee -a "%TEST_LOG_FILE%"

if exist "tests\" (
    echo %CYAN%Running pytest backend tests...%RESET%
    pytest tests/ -v --tb=short 2>&1 | tee -a "%TEST_LOG_FILE%"
)

goto :test_complete

:frontend_tests
echo.
echo %BLUE%🎨 Running Frontend Tests...%RESET%
echo.

if exist "frontend\package.json" (
    cd frontend
    
    echo %CYAN%Installing frontend test dependencies...%RESET%
    npm install >nul 2>&1
    
    echo %CYAN%Running frontend tests...%RESET%
    npm test 2>&1 | tee -a "%TEST_LOG_FILE%"
    
    cd /D "%BASE_DIR%"
) else (
    echo %YELLOW%⚠️ Frontend directory not found or no package.json%RESET%
)

echo %CYAN%Testing frontend discovery functionality...%RESET%
if exist "test_frontend_discovery.js" (
    node test_frontend_discovery.js 2>&1 | tee -a "%TEST_LOG_FILE%"
)

goto :test_complete

:integration_tests
echo.
echo %BLUE%🔗 Running Integration Tests...%RESET%
echo.

echo %CYAN%Testing end-to-end workflow...%RESET%
python test_end_to_end.py 2>&1 | tee -a "%TEST_LOG_FILE%"

echo %CYAN%Testing complete discovery workflow...%RESET%
python test_complete_discovery_workflow.py 2>&1 | tee -a "%TEST_LOG_FILE%"

echo %CYAN%Testing chat integration...%RESET%
python test_chat_real_data.py 2>&1 | tee -a "%TEST_LOG_FILE%"

echo %CYAN%Testing OpenAI competition integration...%RESET%
python test_openai_competition_integration.py 2>&1 | tee -a "%TEST_LOG_FILE%"

goto :test_complete

:performance_tests
echo.
echo %BLUE%⚡ Running Performance Tests...%RESET%
echo.

echo %CYAN%Testing satellite functionality performance...%RESET%
python test_satellite_functionality.py 2>&1 | tee -a "%TEST_LOG_FILE%"

echo %CYAN%Testing system status performance...%RESET%
python test_system_status.py 2>&1 | tee -a "%TEST_LOG_FILE%"

echo %CYAN%Testing all pages and buttons...%RESET%
python test_all_pages_and_buttons.py 2>&1 | tee -a "%TEST_LOG_FILE%"

goto :test_complete

:agent_tests
echo.
echo %BLUE%🤖 Running Agent Tests...%RESET%
echo.

echo %CYAN%Testing agent dataflow...%RESET%
python test_agent_dataflow.py 2>&1 | tee -a "%TEST_LOG_FILE%"

echo %CYAN%Testing agent functionality...%RESET%
python test_agent_functionality.py 2>&1 | tee -a "%TEST_LOG_FILE%"

echo %CYAN%Testing GPT integration...%RESET%
python test_gpt_integration.py 2>&1 | tee -a "%TEST_LOG_FILE%"

goto :test_complete

:data_tests
echo.
echo %BLUE%📊 Running Data Tests...%RESET%
echo.

if exist "tests\test_data_access.py" (
    echo %CYAN%Testing data access...%RESET%
    python -m unittest tests.test_data_access -v 2>&1 | tee -a "%TEST_LOG_FILE%"
) else (
    echo %YELLOW%⚠️ Data access tests not found%RESET%
)

echo %CYAN%Testing connections...%RESET%
python test_connections.py 2>&1 | tee -a "%TEST_LOG_FILE%"

goto :test_complete

:custom_test
echo.
echo %BLUE%📝 Custom Test Runner%RESET%
echo.

echo %CYAN%Available test files:%RESET%
dir /b test_*.py 2>nul

echo.
set /p "TEST_FILE=Enter test file name (without .py): "

if "%TEST_FILE%"=="" (
    echo %RED%❌ No test file specified%RESET%
    goto :test_complete
)

if exist "%TEST_FILE%.py" (
    echo %CYAN%Running %TEST_FILE%.py...%RESET%
    python "%TEST_FILE%.py" 2>&1 | tee -a "%TEST_LOG_FILE%"
) else (
    echo %RED%❌ Test file %TEST_FILE%.py not found%RESET%
)

goto :test_complete

:test_complete
echo.
echo %GREEN%^<====================================================================================^>%RESET%
echo %GREEN%^|                                                                                    ^|%RESET%
echo %GREEN%^|          ✅  TEST SUITE EXECUTION COMPLETED  🎉                                 ^|%RESET%
echo %GREEN%^|                                                                                    ^|%RESET%
echo %GREEN%^<====================================================================================^>%RESET%
echo.

echo %CYAN%📄 Test logs saved to: %TEST_LOG_FILE%%RESET%
echo.

echo %BLUE%Test Summary:%RESET%
if %errorlevel% equ 0 (
    echo %GREEN%✅ Tests completed successfully%RESET%
) else (
    echo %YELLOW%⚠️ Some tests may have failed. Check the logs for details.%RESET%
)

echo.
echo %MAGENTA%💡 Next Steps:%RESET%
echo %CYAN%• Check test logs for detailed results%RESET%
echo %CYAN%• Fix any failing tests before deployment%RESET%
echo %CYAN%• Run start.bat to launch the application%RESET%
echo %CYAN%• Use stop.bat to shutdown services%RESET%

goto :end

:invalid_choice
echo %RED%❌ Invalid choice. Please run the script again and select 1-9.%RESET%
goto :end

:error_exit
echo.
echo %RED%❌ Test setup failed. Please check the error messages above.%RESET%
echo.
echo %BLUE%For troubleshooting:%RESET%
echo %CYAN%• Ensure Python 3.8+ is installed%RESET%
echo %CYAN%• Check STARTUP_GUIDE.md for setup instructions%RESET%
echo %CYAN%• Verify virtual environment can be created%RESET%

:end
echo.
echo %BLUE%Press any key to exit...%RESET%
pause >nul

REM --- Deactivate virtual environment ---
if defined VIRTUAL_ENV (
    call "%VENV_DIR%\Scripts\deactivate.bat"
)

endlocal 