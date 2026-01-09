#!/bin/bash
# =====================================================================
# Test Admin User Auto-Creation
# =====================================================================
# This script tests the secure credential management implementation

echo "========================================"
echo "Testing Secure Credential Management"
echo "========================================"
echo ""

# Check if .env files exist
echo "1. Checking .env files..."
if [ -f "backend/.env" ]; then
    echo "✅ backend/.env exists"
else
    echo "❌ backend/.env missing!"
    exit 1
fi

if [ -f "frontend/.env" ]; then
    echo "✅ frontend/.env exists"
else
    echo "❌ frontend/.env missing!"
    exit 1
fi

echo ""
echo "2. Checking .env variables..."
source backend/.env

if [ -n "$SPRING_DATASOURCE_URL" ]; then
    echo "✅ SPRING_DATASOURCE_URL configured"
else
    echo "❌ SPRING_DATASOURCE_URL not configured"
    exit 1
fi

if [ -n "$ADMIN_USERNAME" ]; then
    echo "✅ ADMIN_USERNAME: $ADMIN_USERNAME"
else
    echo "❌ ADMIN_USERNAME not configured"
    exit 1
fi

if [ -n "$ADMIN_PASSWORD" ]; then
    echo "✅ ADMIN_PASSWORD: [HIDDEN]"
else
    echo "❌ ADMIN_PASSWORD not configured"
    exit 1
fi

echo ""
echo "3. Starting backend..."
cd backend
mvn spring-boot:run > /tmp/backend-startup.log 2>&1 &
BACKEND_PID=$!

echo "   Backend PID: $BACKEND_PID"
echo "   Waiting 30 seconds for startup..."
sleep 30

echo ""
echo "4. Checking startup logs..."
if grep -q "Admin user created successfully" /tmp/backend-startup.log; then
    echo "✅ Admin user auto-created from environment variables"
    grep -A 3 "Admin user created successfully" /tmp/backend-startup.log
elif grep -q "Admin user already exists" /tmp/backend-startup.log; then
    echo "✅ Admin user already exists (expected if run before)"
    grep "Admin user already exists" /tmp/backend-startup.log
else
    echo "⚠️  Admin user creation logs not found"
fi

echo ""
echo "5. Testing admin login..."
sleep 5  # Wait a bit more for full startup

RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"$ADMIN_PASSWORD\"}")

if echo "$RESPONSE" | grep -q "\"success\":true"; then
    echo "✅ Admin login successful!"
    echo "   Token: $(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4 | cut -c1-50)..."
else
    echo "❌ Admin login failed"
    echo "   Response: $RESPONSE"
fi

echo ""
echo "6. Cleaning up..."
kill $BACKEND_PID 2>/dev/null
rm -f /tmp/backend-startup.log

echo ""
echo "========================================"
echo "Test Complete!"
echo "========================================"

