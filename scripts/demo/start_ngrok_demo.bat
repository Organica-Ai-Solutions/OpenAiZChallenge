@echo off
echo ========================================
echo 🚀 Starting ngrok for Public Demo
echo ========================================
echo.

echo Checking if ngrok.exe exists...
if not exist ngrok.exe (
    echo ❌ ngrok.exe not found!
    echo.
    echo Please run setup_ngrok_demo.bat first, or:
    echo 1. Download from: https://ngrok.com/download
    echo 2. Extract ngrok.exe to this folder
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ ngrok.exe found!
echo.
echo Creating public URL for localhost:3000...
echo.
echo ⚠️  IMPORTANT: If this is your first time using ngrok,
echo    it may ask you to sign up at ngrok.com (it's free)
echo.
echo The public URL will appear below.
echo Share this URL with testers and use in your video!
echo.
echo Keep this window open during your demo!
echo.

echo Starting ngrok...
ngrok.exe http 3000 