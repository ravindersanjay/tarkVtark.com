@echo off
REM ================================================
REM Setup PostgreSQL Database for Debate Application
REM ================================================

echo.
echo ================================================
echo Setting up debate_db database...
echo ================================================
echo.

REM Create database
echo Creating database debate_db...
psql -U postgres -c "DROP DATABASE IF EXISTS debate_db;"
psql -U postgres -c "CREATE DATABASE debate_db;"

REM Create schema
echo Creating database schema...
psql -U postgres -d debate_db -f database-schema.sql

REM Insert initial data
echo Inserting initial data...
psql -U postgres -d debate_db -f database-initial-data.sql

REM Verify setup
echo.
echo ================================================
echo Verifying database setup...
echo ================================================
psql -U postgres -d debate_db -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"

echo.
echo ================================================
echo Database Topics:
echo ================================================
psql -U postgres -d debate_db -c "SELECT topic, left_label, right_label, is_active FROM debate_topics;"

echo.
echo ================================================
echo Database setup complete!
echo ================================================
pause

