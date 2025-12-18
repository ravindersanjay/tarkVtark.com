@echo off
REM ================================================
REM Start PostgreSQL Service
REM ================================================

echo Starting PostgreSQL service...
net start postgresql-x64-14

if %ERRORLEVEL% EQU 0 (
    echo PostgreSQL started successfully!
) else (
    echo Trying alternative service name...
    net start postgresql-x64-13
)

pause

