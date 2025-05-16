@echo off
echo Running data access tests...

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
) else (
    echo Virtual environment not found. Please create it first using:
    echo python -m venv venv
    echo venv\Scripts\activate.bat
    exit /b 1
)

REM Run the tests
python -m unittest tests/test_data_access.py -v

REM Deactivate virtual environment
call venv\Scripts\deactivate.bat

echo.
echo Tests completed. Press any key to exit...
pause > nul 