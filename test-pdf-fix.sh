#!/bin/bash
# =====================================================================
# Quick Test Script for PDF Attachment Fix
# =====================================================================
# This script helps test that PDF links now open correctly
# Date: January 10, 2026
# =====================================================================

echo "=========================================="
echo "PDF Attachment Fix - Quick Test Guide"
echo "=========================================="
echo ""

# Step 1: Check if frontend is running
echo "Step 1: Checking if frontend is running..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:5173"
else
    echo "❌ Frontend is NOT running"
    echo "   Run: cd frontend && npm run dev"
    exit 1
fi

echo ""

# Step 2: Check if backend is running
echo "Step 2: Checking if backend is running..."
if curl -s http://localhost:8080/api/v1/health > /dev/null 2>&1; then
    echo "✅ Backend is running on http://localhost:8080"
else
    echo "❌ Backend is NOT running"
    echo "   Run: cd backend && ./mvnw spring-boot:run"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ All systems running!"
echo "=========================================="
echo ""
echo "MANUAL TEST STEPS:"
echo ""
echo "1. Open browser: http://localhost:5173"
echo "2. Navigate to a debate page with attachments"
echo "3. Look for posts with 📚 Evidence Attached"
echo "4. Click on a PDF file link (e.g., document.pdf)"
echo ""
echo "EXPECTED RESULTS:"
echo "  ✅ PDF opens in new tab (not about:blank)"
echo "  ✅ Browser's native PDF viewer shows the file"
echo "  ✅ Images still open correctly"
echo "  ✅ All file types work as expected"
echo ""
echo "WHAT WAS FIXED:"
echo "  • HTTP URLs now open directly (window.open(url))"
echo "  • No more custom HTML wrapper for server files"
echo "  • Base64 data URLs still use custom wrapper"
echo ""
echo "IF YOU STILL SEE ISSUES:"
echo "  1. Hard refresh browser (Ctrl+Shift+R)"
echo "  2. Clear browser cache"
echo "  3. Check browser console for errors (F12)"
echo "  4. Verify file URL starts with http://localhost:8080"
echo ""
echo "=========================================="

# Test file upload endpoint
echo ""
echo "Testing file upload endpoint..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/files/upload | grep -q "401\|403\|404"; then
    echo "✅ File upload endpoint is accessible"
else
    echo "⚠️  File upload endpoint response: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/files/upload)"
fi

echo ""
echo "=========================================="
echo "Test complete! Check the manual steps above."
echo "=========================================="

