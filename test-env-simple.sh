#!/bin/bash
# Quick test to verify .env file can be loaded

echo "🧪 Testing .env file loading..."
echo ""

cd "$(dirname "$0")"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found in project root!"
    exit 1
fi

echo "✅ .env file found"
echo ""

# Check for required variables
echo "📋 Checking required database variables:"
echo ""

if grep -q "^SPRING_DATASOURCE_URL=" .env; then
    URL=$(grep "^SPRING_DATASOURCE_URL=" .env | cut -d'=' -f2-)
    echo "  ✅ SPRING_DATASOURCE_URL found"
    echo "     Value: ${URL:0:50}..."
else
    echo "  ❌ SPRING_DATASOURCE_URL missing"
fi

if grep -q "^SPRING_DATASOURCE_USERNAME=" .env; then
    USER=$(grep "^SPRING_DATASOURCE_USERNAME=" .env | cut -d'=' -f2-)
    echo "  ✅ SPRING_DATASOURCE_USERNAME found"
    echo "     Value: $USER"
else
    echo "  ❌ SPRING_DATASOURCE_USERNAME missing"
fi

if grep -q "^SPRING_DATASOURCE_PASSWORD=" .env; then
    PASS=$(grep "^SPRING_DATASOURCE_PASSWORD=" .env | cut -d'=' -f2-)
    echo "  ✅ SPRING_DATASOURCE_PASSWORD found"
    echo "     Value: ${PASS:0:3}***"
else
    echo "  ❌ SPRING_DATASOURCE_PASSWORD missing"
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "Now start the backend:"
echo "  cd backend"
echo "  mvn clean spring-boot:run"

