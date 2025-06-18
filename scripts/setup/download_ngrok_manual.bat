@echo off
echo ========================================
echo 📥 Manual ngrok Download
echo ========================================
echo.
echo The automated download might have failed.
echo Let's download ngrok manually!
echo.
echo Step 1: Opening ngrok download page...
start https://ngrok.com/download
echo.
echo Step 2: Manual Instructions:
echo 1. ✅ Download the Windows version
echo 2. ✅ Extract the zip file  
echo 3. ✅ Copy ngrok.exe to this folder:
echo    %cd%
echo 4. ✅ Run start_ngrok_demo.bat again
echo.
echo Alternative: Use the free version without signup
echo - Just extract ngrok.exe to this folder
echo - Run: ngrok.exe http 3000
echo - You'll get a temporary URL (perfect for testing!)
echo.
pause 