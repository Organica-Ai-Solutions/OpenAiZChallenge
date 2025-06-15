@echo off
echo ========================================
echo 🚀 Setting up ngrok for Demo & Testing
echo ========================================

echo.
echo Step 1: Downloading ngrok...
curl -Lo ngrok.zip https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip

echo.
echo Step 2: Extracting ngrok...
powershell -Command "Expand-Archive -Path ngrok.zip -DestinationPath . -Force"

echo.
echo Step 3: Cleaning up...
del ngrok.zip

echo.
echo ✅ ngrok setup complete!
echo.
echo ========================================
echo 🎬 DEMO SETUP INSTRUCTIONS
echo ========================================
echo.
echo To start your demo, run these 3 commands in SEPARATE windows:
echo.
echo 📱 Window 1 - Backend (if not already running):
echo    docker-compose up
echo.
echo 🌐 Window 2 - Frontend:
echo    cd frontend
echo    npm run dev
echo.
echo 🚀 Window 3 - ngrok (creates public URL):
echo    ngrok http 3000
echo.
echo The ngrok window will show a URL like: https://abc123.ngrok-free.app
echo Share that URL for testing and your submission video!
echo.
echo ========================================
echo 🧪 Testing Checklist
echo ========================================
echo ✅ Backend running (localhost:8000)
echo ✅ Frontend running (localhost:3000)  
echo ✅ ngrok creates public URL
echo ✅ Public URL shows your full app
echo ✅ All features work (maps, AI, discovery)
echo.
echo Ready for Manus testing and video demo! 🎯
pause 