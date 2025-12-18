@echo off
REM ================================================
REM Clean and Reset PostgreSQL Database
REM ================================================

echo.
echo ================================================
echo WARNING: This will DELETE all data!
echo ================================================
echo.
pause

echo Dropping debate_db database...
psql -U postgres -c "DROP DATABASE IF EXISTS debate_db;"

echo Database cleaned!
echo Run setup-database.bat to recreate.
pause

