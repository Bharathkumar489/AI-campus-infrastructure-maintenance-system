@echo off
echo =======================================================================
echo    AI-BASED CAMPUS INFRASTRUCTURE MAINTENANCE SYSTEM
echo    Multi-Tier Architecture: Frontend ^| Middle ^| API ^| Backend Server
echo =======================================================================
echo.
echo Starting application backend server and interface...
echo.

start "" http://localhost:5000
node backend/index.js
pause
