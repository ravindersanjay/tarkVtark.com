@echo off
REM =====================================================================
REM STOP ALL SERVICES - Debate Application
REM =====================================================================
REM
REM This script stops both backend and frontend services
REM Kills processes on ports 8080 (Backend) and 5173 (Frontend)
REM
REM Usage: stop-all.bat
REM =====================================================================

echo.
echo ========================================
echo  Stopping Debate Application
echo ========================================
echo.

echo [1/3] Stopping Backend (Port 8080)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do (
    echo Killing Backend process (PID: %%a)
    taskkill /F /PID %%a > nul 2>&1
    if errorlevel 1 (
        echo Failed to kill PID %%a
    ) else (
        echo Backend stopped successfully.
    )
)

echo.
echo [2/3] Stopping Frontend (Port 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    echo Killing Frontend process (PID: %%a)
    taskkill /F /PID %%a > nul 2>&1
    if errorlevel 1 (
        echo Failed to kill PID %%a
    ) else (
        echo Frontend stopped successfully.
    )
)

echo.
echo [3/3] Cleanup complete.
echo.
echo ========================================
echo  All Services Stopped
echo ========================================
echo.
echo Ports 8080 and 5173 are now free.
echo You can restart services with start-all.bat
echo.
pause

