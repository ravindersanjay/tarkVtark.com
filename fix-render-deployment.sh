#!/bin/bash
# =====================================================================
# Render.com Deployment Fix Script
# =====================================================================
# This script fixes the "mvnw: No such file or directory" error
# Run this before pushing to GitHub for Render.com deployment

echo "=========================================="
echo "  Render.com Deployment Fix"
echo "=========================================="
echo ""

# Check if we're in project root
if [ ! -f "backend/pom.xml" ]; then
    echo "❌ Error: Not in project root directory"
    echo "Please run this script from: /mnt/d/temp/tarkVtark.com"
    exit 1
fi

echo "✅ Project root confirmed"
echo ""

# Check if Maven Wrapper exists in backend
if [ ! -f "backend/mvnw" ]; then
    echo "📦 Generating Maven Wrapper..."
    cd backend
    mvn -N wrapper:wrapper
    cd ..
    echo "✅ Maven Wrapper generated in backend/"
else
    echo "✅ Maven Wrapper already exists in backend/"
fi
echo ""

# Copy Maven Wrapper to project root
echo "📋 Copying Maven Wrapper to project root..."
cp backend/mvnw .
cp backend/mvnw.cmd .
cp -r backend/.mvn .
echo "✅ Maven Wrapper copied to root"
echo ""

# Make mvnw executable
echo "🔧 Making mvnw executable..."
chmod +x mvnw
chmod +x backend/mvnw
echo "✅ mvnw is now executable"
echo ""

# Verify files
echo "🔍 Verifying files..."
if [ -f "mvnw" ] && [ -f "mvnw.cmd" ] && [ -d ".mvn" ]; then
    echo "✅ All Maven Wrapper files present:"
    ls -lh mvnw mvnw.cmd .mvn/
    echo ""
else
    echo "❌ Error: Some files are missing"
    exit 1
fi

# Git status
echo "=========================================="
echo "  Next Steps for Deployment"
echo "=========================================="
echo ""
echo "1. Add files to git:"
echo "   git add mvnw mvnw.cmd .mvn/ render.yaml"
echo ""
echo "2. Commit changes:"
echo "   git commit -m 'Add Maven Wrapper for Render.com deployment'"
echo ""
echo "3. Push to GitHub:"
echo "   git push origin main"
echo ""
echo "4. Deploy on Render.com:"
echo "   - Build command: ./mvnw clean package -DskipTests -f backend/pom.xml"
echo "   - Start command: cd backend && java -Dserver.port=\$PORT -jar target/*.jar"
echo ""
echo "=========================================="
echo "✅ Fix complete! Ready for deployment"
echo "=========================================="

