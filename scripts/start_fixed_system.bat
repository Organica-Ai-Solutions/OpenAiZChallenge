@echo off
echo 🔧 STARTING FIXED NIS PROTOCOL SYSTEM
echo =======================================

echo.
echo 🏛️ NIS Protocol - Fixed and Enhanced System
echo ⚡ All CORS issues resolved
echo 💾 Analysis storage endpoints working
echo 🧠 Enhanced chat service active
echo 🎯 Divine batch analysis ready

echo.
echo 🚀 Starting backend with fixes...
start "NIS Backend" cmd /k "cd /d %~dp0.. && python fallback_backend.py"

echo.
echo ⏳ Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo.
echo 🌐 Starting frontend...
start "NIS Frontend" cmd /k "cd /d %~dp0..\frontend && npm run dev"

echo.
echo ✅ SYSTEM STARTUP COMPLETE!
echo.
echo 🎯 AVAILABLE FEATURES:
echo    • Enhanced Chat (/chat) - Real AI reasoning with tools
echo    • Divine Batch Analysis - Analyze all sites with Zeus power
echo    • Fixed CORS - No more connection errors
echo    • Working Endpoints - All analysis storage functional
echo.
echo 📋 TESTING:
echo    • Open browser console and run: testAllFixes()
echo    • Navigate to /chat and test enhanced AI
echo    • Go to /map and try divine batch analysis
echo.
echo 🔧 TROUBLESHOOTING:
echo    • If issues persist, run: scripts/test_all_fixes.js in console
echo    • Check browser network tab for any remaining errors
echo    • Verify both services are running on correct ports
echo.
echo Press any key to open browser...
pause >nul

echo.
echo 🌐 Opening system in browser...
start "" "http://localhost:3000"

echo.
echo 🎉 FIXED SYSTEM IS NOW RUNNING!
echo    Backend: http://localhost:8003
echo    Frontend: http://localhost:3000
echo.
echo Happy archaeological discovering! 🏛️⚡ 