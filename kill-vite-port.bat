@echo off
REM ================================================
REM Kill process on port 5174/5175 (Vite dev server)
REM ================================================

echo Killing processes on ports 5174, 5175...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5174') do (
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5175') do (
    taskkill /F /PID %%a 2>nul
)

echo Vite ports freed!
pause

