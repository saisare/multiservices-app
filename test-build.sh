#!/bin/bash

# 🧪 Test Script - Vérifier que toutes les pages compilent

echo "=========================================="
echo "🧪 TEST FRONTEND COMPILATION"
echo "=========================================="
echo ""

cd "c:/Users/mon pc/Desktop/office/ani web-entreprise/projet strucutre entreprise/multiservices-app/frontend"

echo "📦 Building frontend..."
npm run build > /tmp/build.log 2>&1

if [ $? -eq 0 ]; then
  echo "✅ BUILD SUCCESS!"
  echo ""
  echo "📊 Build Summary:"
  tail -50 /tmp/build.log | grep -E "compiled|pages|routes|warnings|error" || echo "Build summary not available"
  echo ""
  echo "🚀 Ready to deploy!"
else
  echo "❌ BUILD FAILED!"
  echo ""
  echo "Errors:"
  tail -100 /tmp/build.log | grep -E "error|Error|ERROR" -A 2 -B 2
fi

echo ""
echo "=========================================="
echo "✅ Test Completed"
echo "=========================================="
