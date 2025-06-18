@echo off
echo 🌍 Starting Archaeological Discovery System (Windows)...

REM Load environment variables
if exist .env (
    echo Loading environment variables...
    for /f "tokens=1,2 delims==" %%a in ('type .env ^| findstr /v "^#" ^| findstr /v "^$"') do set %%a=%%b
)

REM Display Google Maps API key status
if defined NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (
    echo ✅ Google Maps API Key loaded
) else (
    echo ⚠️  Google Maps API Key not found - using fallback map
)

echo Starting frontend development server...
cd frontend
npm run dev
