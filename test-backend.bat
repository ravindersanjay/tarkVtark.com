@echo off
REM ================================================
REM Test Backend Health
REM ================================================

echo Testing backend health endpoint...
curl http://localhost:8080/api/v1/topics

echo.
echo.
echo If you see JSON array above, backend is working!
pause

