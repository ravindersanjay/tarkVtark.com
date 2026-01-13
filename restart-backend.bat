@echo off
REM =====================================================================
REM RESTART BACKEND - Contact Form Fix
REM =====================================================================
REM
REM This script restarts the backend to load the new ContactController
REM Run this to fix "Failed to send message" error
REM
REM =====================================================================

echo.
echo ========================================
echo  Restarting Backend for Contact Form
echo ========================================
echo.

echo [1/3] Killing backend process on port 8080...
echo.

REM Kill process on port 8080 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do (
    echo Killing backend process (PID: %%a)
    taskkill /F /PID %%a > nul 2>&1
)

echo Port 8080 cleared.
echo.

echo [2/3] Starting Backend with ContactController...
echo.
echo This will take 30-60 seconds...
echo.

start "Debate Backend - Contact Fixed" cmd /k "cd backend && echo Compiling backend with ContactController... && mvn clean spring-boot:run"

echo.
echo [3/3] Backend is starting...
echo.

echo ========================================
echo  Backend Restart Initiated
echo ========================================
echo.
echo Check the "Debate Backend - Contact Fixed" window for progress.
echo.
echo Wait for this message in the backend window:
echo   "Started DebateArenaApplication in X seconds"
echo.
echo Then test the contact form:
echo   http://localhost:5173/contact
echo.
echo To verify the API is working:
echo   http://localhost:8080/api/v1/contact/messages
echo   Should return [] or list of messages (NOT 404)
echo.
pause

