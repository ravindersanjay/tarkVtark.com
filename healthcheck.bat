@echo off
REM =====================================================================
REM HEALTHCHECK - Debate Application
REM =====================================================================
REM
REM Checks the status of all services
REM Works in both CMD and PowerShell
REM
REM Usage: healthcheck.bat
REM =====================================================================

echo.
echo ========================================
echo  Debate Application Health Check
echo ========================================
echo.

REM Check Backend (Port 8080)
echo [1/4] Checking Backend (Port 8080)...
netstat -ano | findstr ":8080" > nul
if %errorlevel% equ 0 (
    echo   Status: RUNNING
    netstat -ano | findstr ":8080"
) else (
    echo   Status: NOT RUNNING
    echo   ERROR: Backend is not running on port 8080
)

echo.

REM Check Frontend (Port 5173)
echo [2/4] Checking Frontend (Port 5173)...
netstat -ano | findstr ":5173" > nul
if %errorlevel% equ 0 (
    echo   Status: RUNNING
    netstat -ano | findstr ":5173"
) else (
    echo   Status: NOT RUNNING
    echo   ERROR: Frontend is not running on port 5173
)

echo.

REM Check Database (Port 5432)
echo [3/4] Checking PostgreSQL (Port 5432)...
netstat -ano | findstr ":5432" > nul
if %errorlevel% equ 0 (
    echo   Status: RUNNING
    netstat -ano | findstr ":5432"
) else (
    echo   Status: NOT RUNNING
    echo   WARNING: PostgreSQL may not be running on port 5432
)

echo.

REM Test Backend API
echo [4/4] Testing Backend API...
curl -s http://localhost:8080/api/v1/topics > nul 2>&1
if %errorlevel% equ 0 (
    echo   Status: API RESPONDING
    echo   Endpoint: http://localhost:8080/api/v1/topics
) else (
    echo   Status: API NOT RESPONDING
    echo   ERROR: Cannot connect to backend API
)

echo.
echo ========================================
echo  Health Check Complete
echo ========================================
echo.

REM Count errors
set ERROR_COUNT=0
netstat -ano | findstr ":8080" > nul || set /a ERROR_COUNT+=1
netstat -ano | findstr ":5173" > nul || set /a ERROR_COUNT+=1
curl -s http://localhost:8080/api/v1/topics > nul 2>&1 || set /a ERROR_COUNT+=1

if %ERROR_COUNT% equ 0 (
    echo Result: ALL SERVICES HEALTHY
    echo.
    echo You can access:
    echo   - Frontend: http://localhost:5173
    echo   - Admin Panel: http://localhost:5173/admin
    echo   - Backend API: http://localhost:8080/api/v1/topics
) else (
    echo Result: %ERROR_COUNT% ISSUE(S) FOUND
    echo.
    echo Please check the errors above and:
    echo   1. Make sure services are running (run start-all.bat)
    echo   2. Check service windows for error messages
    echo   3. Verify PostgreSQL is running
)

echo.
pause

