#!/bin/bash
# =====================================================================
# Backend Startup Script
# =====================================================================
# This script properly starts the backend and handles port conflicts

echo "========================================"
echo "Starting TarkVtark Backend"
echo "========================================"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/backend" || exit 1

# Kill any existing process on port 8080
echo "1. Checking for existing processes on port 8080..."
if lsof -ti:8080 > /dev/null 2>&1; then
    echo "   Found process on port 8080, killing..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null
    sleep 2
    echo "   ✅ Port 8080 is now free"
else
    echo "   ✅ Port 8080 is free"
fi

echo ""
echo "2. Checking .env file..."
if [ -f ".env" ]; then
    echo "   ✅ .env file found"
else
    echo "   ❌ .env file not found!"
    echo "   Run: cp .env.example .env"
    exit 1
fi

echo ""
echo "3. Starting backend..."
echo "   Method: Java JAR (recommended)"
echo "   Port: 8080"
echo ""

# Start backend in background
java -jar target/debate-backend-1.0.0.jar > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

echo "   Backend PID: $BACKEND_PID"
echo "   Logs: /tmp/backend.log"
echo ""
echo "   Waiting for startup (30 seconds)..."

# Wait for startup
sleep 30

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo ""
    echo "✅ Backend started successfully!"
    echo ""
    echo "🔍 Checking admin user initialization..."
    grep -E "(Admin user|admin)" /tmp/backend.log | tail -3
    echo ""
    echo "🌐 Backend is running at: http://localhost:8080/api/v1"
    echo ""
    echo "📝 Test endpoints:"
    echo "   curl http://localhost:8080/api/v1/topics"
    echo "   curl -X POST http://localhost:8080/api/v1/admin/login \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"username\":\"admin\",\"password\":\"Admin@2026\"}'"
    echo ""
    echo "🛑 To stop backend:"
    echo "   kill $BACKEND_PID"
    echo "   OR: pkill -f debate-backend"
    echo ""
    echo "📊 View logs:"
    echo "   tail -f /tmp/backend.log"
    echo ""
else
    echo ""
    echo "❌ Backend failed to start!"
    echo ""
    echo "Check logs:"
    tail -50 /tmp/backend.log
    echo ""
    exit 1
fi

echo "========================================"
echo "Backend is ready!"
echo "========================================"

