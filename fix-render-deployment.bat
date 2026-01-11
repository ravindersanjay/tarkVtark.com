@echo off
REM =====================================================================
REM Render.com Deployment Fix Script (Windows)
REM =====================================================================
REM This script fixes the "mvnw: No such file or directory" error
REM Run this before pushing to GitHub for Render.com deployment

echo ==========================================
echo   Render.com Deployment Fix
echo ==========================================
echo.

REM Check if we're in project root
if not exist "backend\pom.xml" (
    echo ERROR: Not in project root directory
    echo Please run this script from: D:\temp\tarkVtark.com
    pause
    exit /b 1
)

echo [OK] Project root confirmed
echo.

REM Check if Maven Wrapper exists in backend
if not exist "backend\mvnw" (
    echo [*] Generating Maven Wrapper...
    cd backend
    mvn -N wrapper:wrapper
    cd ..
    echo [OK] Maven Wrapper generated in backend/
) else (
    echo [OK] Maven Wrapper already exists in backend/
)
echo.

REM Copy Maven Wrapper to project root
echo [*] Copying Maven Wrapper to project root...
copy backend\mvnw .
copy backend\mvnw.cmd .
xcopy backend\.mvn .mvn\ /E /I /Y
echo [OK] Maven Wrapper copied to root
echo.

REM Verify files
echo [*] Verifying files...
if exist "mvnw" if exist "mvnw.cmd" if exist ".mvn" (
    echo [OK] All Maven Wrapper files present
    dir mvnw mvnw.cmd .mvn
    echo.
) else (
    echo [ERROR] Some files are missing
    pause
    exit /b 1
)

REM Git instructions
echo ==========================================
echo   Next Steps for Deployment
echo ==========================================
echo.
echo 1. Add files to git:
echo    git add mvnw mvnw.cmd .mvn/ render.yaml
echo.
echo 2. Commit changes:
echo    git commit -m "Add Maven Wrapper for Render.com deployment"
echo.
echo 3. Push to GitHub:
echo    git push origin main
echo.
echo 4. Deploy on Render.com:
echo    - Build command: ./mvnw clean package -DskipTests -f backend/pom.xml
echo    - Start command: cd backend ^&^& java -Dserver.port=$PORT -jar target/*.jar
echo.
echo ==========================================
echo [OK] Fix complete! Ready for deployment
echo ==========================================
echo.
pause

