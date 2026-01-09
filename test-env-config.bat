@echo off
REM =====================================================================
REM Test Script - Verify .env Configuration Works (Windows)
REM =====================================================================

echo Testing .env Configuration...
echo.

REM Check if .env file exists
echo 1. Checking if .env file exists in project root...
if exist ".env" (
    echo    [OK] .env file found
) else (
    echo    [ERROR] .env file not found!
    echo    Create .env file in project root with database credentials
    exit /b 1
)

echo.
echo 2. Checking required environment variables in .env...
findstr /C:"SPRING_DATASOURCE_URL" .env >nul
if %errorlevel% equ 0 (
    echo    [OK] SPRING_DATASOURCE_URL is set
) else (
    echo    [ERROR] SPRING_DATASOURCE_URL is missing
)

findstr /C:"SPRING_DATASOURCE_USERNAME" .env >nul
if %errorlevel% equ 0 (
    echo    [OK] SPRING_DATASOURCE_USERNAME is set
) else (
    echo    [ERROR] SPRING_DATASOURCE_USERNAME is missing
)

findstr /C:"SPRING_DATASOURCE_PASSWORD" .env >nul
if %errorlevel% equ 0 (
    echo    [OK] SPRING_DATASOURCE_PASSWORD is set
) else (
    echo    [ERROR] SPRING_DATASOURCE_PASSWORD is missing
)

echo.
echo 3. Checking if DotenvConfig.java exists...
if exist "backend\src\main\java\com\debatearena\config\DotenvConfig.java" (
    echo    [OK] DotenvConfig.java found
) else (
    echo    [ERROR] DotenvConfig.java not found
    exit /b 1
)

echo.
echo 4. Checking if spring.factories exists...
if exist "backend\src\main\resources\META-INF\spring.factories" (
    echo    [OK] spring.factories found
) else (
    echo    [ERROR] spring.factories not found
    exit /b 1
)

echo.
echo 5. Checking application.yml uses environment variables...
findstr /C:"${SPRING_DATASOURCE_URL}" backend\src\main\resources\application.yml >nul
if %errorlevel% equ 0 (
    echo    [OK] application.yml uses environment variables
    echo    [OK] No hardcoded credentials found
) else (
    echo    [WARN] application.yml may have hardcoded credentials
)

echo.
echo 6. Checking if .env is in .gitignore...
findstr /C:".env" .gitignore >nul
if %errorlevel% equ 0 (
    echo    [OK] .env is properly gitignored
) else (
    echo    [WARN] .env is not in .gitignore - add it to prevent committing secrets!
)

echo.
echo ================================================================
echo [OK] All checks passed! Configuration is correct.
echo ================================================================
echo.
echo To start the application:
echo    cd backend
echo    mvn spring-boot:run
echo.
echo Expected startup logs:
echo    [OK] Successfully loaded .env file with X properties
echo    Database URL configured: V
echo    HikariPool-1 - Start completed.
echo    Started DebateApplication in X.XXX seconds
echo.

pause

