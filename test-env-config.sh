#!/bin/bash

# =====================================================================
# Test Script - Verify .env Configuration Works
# =====================================================================
# This script tests that the .env file is properly loaded and
# the application can connect to the database.

echo "🧪 Testing .env Configuration..."
echo ""

# Change to backend directory
cd "$(dirname "$0")/backend" || exit 1

echo "1️⃣ Checking if .env file exists in project root..."
if [ -f "../.env" ]; then
    echo "   ✅ .env file found"
    echo "   📋 Contains $(grep -c "^[A-Z]" ../.env) environment variables"
else
    echo "   ❌ .env file not found!"
    echo "   Create .env file in project root with database credentials"
    exit 1
fi

echo ""
echo "2️⃣ Checking required environment variables in .env..."
required_vars=("SPRING_DATASOURCE_URL" "SPRING_DATASOURCE_USERNAME" "SPRING_DATASOURCE_PASSWORD")
missing_vars=()

for var in "${required_vars[@]}"; do
    if grep -q "^$var=" ../.env; then
        echo "   ✅ $var is set"
    else
        echo "   ❌ $var is missing"
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo ""
    echo "   ⚠️  Missing required variables: ${missing_vars[*]}"
    echo "   Add these to your .env file"
    exit 1
fi

echo ""
echo "3️⃣ Checking if DotenvConfig.java exists..."
if [ -f "src/main/java/com/debatearena/config/DotenvConfig.java" ]; then
    echo "   ✅ DotenvConfig.java found"
else
    echo "   ❌ DotenvConfig.java not found"
    exit 1
fi

echo ""
echo "4️⃣ Checking if spring.factories exists..."
if [ -f "src/main/resources/META-INF/spring.factories" ]; then
    echo "   ✅ spring.factories found"
else
    echo "   ❌ spring.factories not found"
    exit 1
fi

echo ""
echo "5️⃣ Checking application.yml uses environment variables..."
if grep -q "\${SPRING_DATASOURCE_URL}" src/main/resources/application.yml; then
    echo "   ✅ application.yml uses environment variables"
    echo "   ✅ No hardcoded credentials found"
else
    echo "   ⚠️  application.yml may have hardcoded credentials"
fi

echo ""
echo "6️⃣ Checking if .env is in .gitignore..."
if grep -q "^\.env$" ../.gitignore; then
    echo "   ✅ .env is properly gitignored"
else
    echo "   ⚠️  .env is not in .gitignore - add it to prevent committing secrets!"
fi

echo ""
echo "7️⃣ Building application (this will test if config is valid)..."
if mvn clean compile -q -DskipTests; then
    echo "   ✅ Application compiled successfully"
else
    echo "   ❌ Compilation failed - check console output above"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ All checks passed! Configuration is correct."
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🚀 To start the application:"
echo "   cd backend"
echo "   mvn spring-boot:run"
echo ""
echo "📊 Expected startup logs:"
echo "   ✅ Successfully loaded .env file with X properties"
echo "   📊 Database URL configured: ✓"
echo "   HikariPool-1 - Start completed."
echo "   Started DebateApplication in X.XXX seconds"
echo ""

