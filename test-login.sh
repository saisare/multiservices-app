#!/bin/bash
# Simple test script to verify login

echo "🧪 TEST DE CONNEXION"
echo "===================="
echo ""
echo "Test 1: Vérifier si auth-service répond"
curl -s http://localhost:3002/health | jq . || echo "❌ Auth service not responding"
echo ""

echo "Test 2: Connexion avec jean.martin@blg-engineering.com / Junior2@"
curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jean.martin@blg-engineering.com","password":"Junior2@","departement":"btp"}' | jq .

echo ""
echo "Test 3: Connexion avec juniornossi1@gmail.com / junior23@"
curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juniornossi1@gmail.com","password":"junior23@","departement":"btp"}' | jq .

echo ""
echo "✅ Tests terminés"
