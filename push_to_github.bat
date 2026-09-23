@echo off
setlocal
echo ===================================================
echo CampusCare AI - GitHub Push Helper
echo ===================================================
set "GIT_EXE=%LOCALAPPDATA%\GitHubDesktop\app-3.6.6\resources\app\git\cmd\git.exe"

if not exist "%GIT_EXE%" (
    echo [ERROR] Git was not found at %GIT_EXE%
    pause
    exit /b 1
)

echo Checking Git status...
"%GIT_EXE%" status

echo.
echo Pushing clean code to:
echo https://github.com/Bharathkumar489/AI-campus-infrastructure-maintenance-system.git
echo.
"%GIT_EXE%" push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================================
    echo [SUCCESS] Your code is now live on GitHub!
    echo Go to https://dashboard.render.com to deploy it.
    echo ===================================================
) else (
    echo.
    echo If prompted, please sign in or use GitHub Desktop!
)

pause
