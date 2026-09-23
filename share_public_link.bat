@echo off
title Campus Infrastructure Maintenance System - Public Link
echo =======================================================================
echo    AI-BASED CAMPUS INFRASTRUCTURE MAINTENANCE SYSTEM
echo    Launching Cloudflare Public Secure Tunnel...
echo =======================================================================
echo.

:: Check if server is running on port 5000, if not, start it
netstat -ano | findstr :5000 | findstr LISTENING >nul
if %errorlevel% neq 0 (
    echo [1/2] Starting backend and web application server...
    start /b node server/index.js
    timeout /t 2 /nobreak >nul
) else (
    echo [1/2] Application server is already running on port 5000.
)

echo [2/2] Launching Cloudflare Tunnel (No passwords, No timeouts)...
echo.
echo =======================================================================
echo Look for your public HTTPS link below:
echo =======================================================================
echo.
cloudflared.exe tunnel --url http://localhost:5000
pause
