@echo off
REM =====================================================================
REM START ALL SERVICES - Debate Application
REM =====================================================================
REM
REM This script starts both backend and frontend services
REM Kills any processes on ports 8080 and 5173 before starting
REM Works in both CMD and PowerShell
REM
REM Usage: start-all.bat
REM =====================================================================

echo.
echo ========================================
echo  Starting Debate Application
echo ========================================
echo.

REM Check if backend directory exists
if not exist "backend" (
    echo ERROR: Backend directory not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

REM Check if frontend directory exists
if not exist "frontend" (
    echo ERROR: Frontend directory not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo [1/4] Killing processes on ports 8080 and 5173...
echo.

REM Kill process on port 8080 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do (
    echo Killing process on port 8080 (PID: %%a)
    taskkill /F /PID %%a > nul 2>&1
)

REM Kill process on port 5173 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    echo Killing process on port 5173 (PID: %%a)
    taskkill /F /PID %%a > nul 2>&1
)

echo Ports cleared successfully.
echo.

echo [2/4] Starting Backend (Spring Boot)...
echo.
start "Debate Backend" cmd /k "cd backend && echo Compiling backend... && mvn clean spring-boot:run"

echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak > nul

echo.
echo [3/4] Starting Frontend (Vite on port 5173)...
echo.
start "Debate Frontend" cmd /k "cd frontend && echo Starting frontend on port 5173... && npm run dev -- --port 5173 --host"

echo.
echo [4/4] Services Starting...
echo.
echo ========================================
echo  Startup Complete!
echo ========================================
echo.
echo Backend window: "Debate Backend"
echo Frontend window: "Debate Frontend"
echo.
echo Ports have been cleared and services started:
echo   - Backend: http://localhost:8080/api/v1/topics (Port 8080)
echo   - Frontend: http://localhost:5173 (Port 5173 - FIXED)
echo   - Admin: http://localhost:5173/admin
echo.
echo Wait 30-60 seconds for full startup, then:
echo   Open http://localhost:5173 in your browser
echo.
echo Check the service windows for any errors.
echo.
pause



