#!/bin/bash
# Test rapide de la validation mot de passe

echo "🧪 TEST DE VALIDATION MOT DE PASSE"
echo "=================================="
echo ""

# Test 1: Mot de passe faible
echo "Test 1: Mot de passe faible 'dongo23?'"
echo "Résultat attendu: Score < 40, devrait être refusé"
echo ""

# Test 2: Mot de passe moyen
echo "Test 2: Mot de passe moyen 'Dongo23'"
echo "Résultat attendu: Score 60-80, devrait être accepté avec avertissement"
echo ""

# Test 3: Mot de passe fort
echo "Test 3: Mot de passe fort 'Dongo23!'"
echo "Résultat attendu: Score 100, devrait être accepté"
echo ""

echo "✅ Testez maintenant sur http://localhost:3000/login"
echo "   - Cliquez sur 'Créer un compte'"
echo "   - Tapez différents mots de passe et observez la barre de progression"
echo "   - Vérifiez que 'dongo23?' est refusé"
echo "   - Vérifiez que 'Dongo23' est accepté avec avertissement"
echo "   - Vérifiez que 'Dongo23!' est accepté sans avertissement"