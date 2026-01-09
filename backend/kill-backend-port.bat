@echo off
REM ================================================
REM Kill process on port 8080 and restart backend
REM ================================================

echo Killing process on port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
    taskkill /F /PID %%a 2>nul
)

echo Port 8080 freed!
echo.
echo Starting backend...
cd backend-java
call mvn clean compile spring-boot:run

