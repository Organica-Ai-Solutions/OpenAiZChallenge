@echo off
echo 🔧 Fixing Next.js Fetch Error...
echo.

echo 🛑 Step 1: Stopping all services...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM python.exe 2>nul
timeout /T 2 /NOBREAK >nul

echo 🧹 Step 2: Clearing Next.js cache...
cd frontend
if exist .next rmdir /S /Q .next
if exist node_modules\.cache rmdir /S /Q node_modules\.cache
cd ..

echo 🔄 Step 3: Restarting backends...
start "Storage Backend" cmd /k "python backend\simple_storage_backend.py"
timeout /T 3 /NOBREAK >nul

start "Fallback Backend" cmd /k "python backend\fallback_backend.py"
timeout /T 3 /NOBREAK >nul

start "Main Backend" cmd /k "python backend\backend_main.py"
timeout /T 5 /NOBREAK >nul

echo 🌐 Step 4: Restarting frontend...
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ✅ Services restarted! Wait 30 seconds then try:
echo 🌍 http://localhost:3000
echo.
echo 💡 If fetch errors persist:
echo 1. Check browser console for specific error details
echo 2. Verify all backends are running (ports 8000, 8003, 8004)
echo 3. Try refreshing the page or hard refresh (Ctrl+Shift+R)
echo 4. Check if any antivirus/firewall is blocking localhost connections
echo.

pause 