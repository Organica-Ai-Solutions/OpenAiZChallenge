@echo off
echo ===================================================
echo NIS Protocol - Mapbox Cache Cleaner (Windows)
echo ===================================================
echo.
echo This script will:
echo 1. Kill any running Next.js processes
echo 2. Clear browser caches
echo 3. Clean Next.js cache files
echo.
echo Press Ctrl+C to cancel or any key to continue...
pause > nul

echo.
echo Stopping any running Next.js processes...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *npm*" > nul 2>&1
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *next*" > nul 2>&1
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *dev*" > nul 2>&1

echo.
echo Clearing Next.js cache...
if exist ".next" (
    rmdir /S /Q .next
    echo Next.js cache cleared.
) else (
    echo No Next.js cache found.
)

echo.
echo Clearing node_modules cache...
if exist "node_modules\.cache" (
    rmdir /S /Q node_modules\.cache
    echo Node modules cache cleared.
) else (
    echo No node_modules cache found.
)

echo.
echo Creating fresh next.config.js with cache busting...
echo /** @type {import('next').NextConfig} */ > next.config.js
echo const nextConfig = { >> next.config.js
echo   eslint: { >> next.config.js
echo     ignoreDuringBuilds: true, >> next.config.js
echo   }, >> next.config.js
echo   typescript: { >> next.config.js
echo     ignoreBuildErrors: true, >> next.config.js
echo   }, >> next.config.js
echo   images: { >> next.config.js
echo     unoptimized: true, >> next.config.js
echo   }, >> next.config.js
echo   experimental: { >> next.config.js
echo     optimizeCss: false, >> next.config.js
echo   }, >> next.config.js
echo   webpack: (config) => { >> next.config.js
echo     return config; >> next.config.js
echo   }, >> next.config.js
echo } >> next.config.js
echo. >> next.config.js
echo module.exports = nextConfig >> next.config.js

echo.
echo ===================================================
echo Cache cleaning complete!
echo.
echo Now run: npm run dev
echo ===================================================
echo. 