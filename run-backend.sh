#!/bin/bash
# =====================================================================
# Simple Backend Startup
# =====================================================================

echo "========================================"
echo "🚀 Starting TarkVtark Backend"
echo "========================================"
echo ""

# Change to backend directory
cd backend || { echo "❌ Backend directory not found"; exit 1; }

# Check if JAR exists
if [ ! -f "target/debate-backend-1.0.0.jar" ]; then
    echo "❌ JAR file not found. Building..."
    mvn clean package -DskipTests -q
    echo "✅ Build complete"
fi

# Kill any process on port 8080
echo "🔍 Checking port 8080..."
lsof -ti:8080 2>/dev/null | xargs kill -9 2>/dev/null && echo "   Killed existing process" || echo "   Port is free"
sleep 1

echo ""
echo "🔧 Starting backend..."
echo "   URL: http://localhost:8080/api/v1"
echo ""

# Start backend
java -jar target/debate-backend-1.0.0.jar

# If we get here, backend stopped
echo ""
echo "⚠️  Backend stopped"

