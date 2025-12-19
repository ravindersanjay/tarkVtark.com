@echo off
REM =====================================================================
REM START ALL SERVICES - Debate Application
REM =====================================================================
REM
REM This script starts both backend and frontend services
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

echo [1/3] Starting Backend (Spring Boot)...
echo.
start "Debate Backend" cmd /k "cd backend && echo Compiling backend... && mvn clean spring-boot:run"

echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak > nul

echo.
echo [2/3] Starting Frontend (Vite)...
echo.
start "Debate Frontend" cmd /k "cd frontend && echo Starting frontend... && npm run dev"

echo.
echo [3/3] Services Starting...
echo.
echo ========================================
echo  Startup Complete!
echo ========================================
echo.
echo Backend window: "Debate Backend"
echo Frontend window: "Debate Frontend"
echo.
echo Wait 30-60 seconds for full startup, then:
echo   - Backend: http://localhost:8080/api/v1/topics
echo   - Frontend: http://localhost:5173
echo   - Admin: http://localhost:5173/admin
echo.
echo Check the service windows for any errors.
echo.
pause

