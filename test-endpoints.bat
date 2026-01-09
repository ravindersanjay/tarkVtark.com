@echo off
echo ========================================
echo Testing Backend Endpoints
echo ========================================
echo.

echo [1/3] Testing Topics Endpoint...
curl -s http://localhost:8080/api/v1/topics | jq -r ".[0].topic" 2>nul || echo Failed to get topics
echo.

echo [2/3] Testing Guidelines Endpoint...
curl -s http://localhost:8080/api/v1/admin/guidelines 2>nul || echo Failed to get guidelines
echo.

echo [3/3] Testing FAQ Endpoint...
curl -s http://localhost:8080/api/v1/admin/faq 2>nul || echo Failed to get FAQ
echo.

echo ========================================
echo Test Complete
echo ========================================
pause

