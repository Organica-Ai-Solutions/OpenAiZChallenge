@echo off

REM Start script for the NIS Protocol project on Windows

REM Create necessary directories
mkdir data\lidar 2>nul
mkdir data\satellite 2>nul
mkdir data\colonial_texts 2>nul
mkdir data\overlays 2>nul
mkdir outputs\findings 2>nul
mkdir outputs\logs 2>nul
mkdir outputs\memory 2>nul

REM Check if virtual environment exists
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
) else (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
)

REM Start the API server
echo Starting NIS Protocol API server...
python run_api.py 