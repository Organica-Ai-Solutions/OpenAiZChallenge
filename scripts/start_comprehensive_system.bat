@echo off
echo.
echo 🏛️ ═══════════════════════════════════════════════════════════════ 🏛️
echo 💾        COMPREHENSIVE NIS PROTOCOL SYSTEM STARTUP             💾  
echo 🏛️ ═══════════════════════════════════════════════════════════════ 🏛️
echo.

echo 🚀 Starting comprehensive archaeological discovery system...
echo 📊 This includes ALL backends with storage integration
echo.

echo 🛑 Stopping any existing Python processes...
taskkill /F /IM python.exe 2>nul
timeout /T 2 /NOBREAK >nul

echo.
echo 🚀 Starting Storage Backend (Port 8004)...
start "Storage Backend" cmd /k "python backend\simple_storage_backend.py"
timeout /T 3 /NOBREAK >nul

echo 🚀 Starting Fallback Backend (Port 8003)...  
start "Fallback Backend" cmd /k "python backend\fallback_backend.py"
timeout /T 3 /NOBREAK >nul

echo 🚀 Starting Main Backend (Port 8000)...
start "Main Backend" cmd /k "python backend\backend_main.py"
timeout /T 5 /NOBREAK >nul

echo.
echo 🌐 Starting Frontend (Port 3000)...
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..
timeout /T 5 /NOBREAK >nul

echo.
echo 🔍 Testing system health...
timeout /T 10 /NOBREAK >nul

echo.
echo 📊 Running comprehensive storage test...
node scripts/test_comprehensive_storage.js

echo.
echo 🏛️ ═══════════════════════════════════════════════════════════════ 🏛️
echo ✅                    SYSTEM STARTUP COMPLETE!                    ✅
echo 🏛️ ═══════════════════════════════════════════════════════════════ 🏛️
echo.
echo 🌍 Access your system:
echo    Frontend:        http://localhost:3000
echo    Main Backend:    http://localhost:8000
echo    Fallback Backend: http://localhost:8003  
echo    Storage Backend: http://localhost:8004
echo    Storage Stats:   http://localhost:8004/storage/stats
echo.
echo 💾 STORAGE FEATURES:
echo    • Automatic analysis storage (confidence ≥ 0.7)
echo    • Divine analysis always stored
echo    • Enhanced card data retrieval
echo    • Archaeological sites management
echo    • Real-time storage statistics
echo.
echo 🎯 NEXT STEPS:
echo    1. Open http://localhost:3000 in your browser
echo    2. Run divine analysis on archaeological sites
echo    3. Check enhanced site cards for stored data
echo    4. Monitor storage at http://localhost:8004/storage/stats
echo.

pause 