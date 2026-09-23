@echo off
echo =======================================================================
echo    AI-BASED CAMPUS INFRASTRUCTURE MAINTENANCE SYSTEM
echo    Predictive Maintenance ^& Work Order Management Platform
echo =======================================================================
echo.
echo Starting application server and interface...
echo.

start "" http://localhost:5000
node server/index.js
pause
