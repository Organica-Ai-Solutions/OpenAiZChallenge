@echo off

echo Starting NIS Protocol Application

echo Starting API Server...
start cmd /k "cd /d %~dp0 && python -m venv venv && call venv\Scripts\activate && pip install -r requirements.txt && python run_api.py"

echo Starting Frontend Server...
start cmd /k "cd /d %~dp0\frontend && npm install && npm run dev"

echo.
echo NIS Protocol servers starting...
echo API will be available at http://localhost:8000
echo Frontend will be available at http://localhost:3000
echo.
echo Press any key to close this window.
pause > nul 