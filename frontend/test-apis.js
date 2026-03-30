// Test script pour vérifier les APIs frontend
// À exécuter avec Node.js pour tester les connexions

const API_BASE = 'http://localhost:3001'; // Gateway

async function testAPI(endpoint, description) {
  try {
    console.log(`\n🧪 Test: ${description}`);
    console.log(`📡 URL: ${API_BASE}${endpoint}`);

    const response = await fetch(`${API_BASE}${endpoint}`);
    const data = await response.json();

    if (response.ok) {
      console.log(`✅ SUCCESS: ${response.status}`);
      console.log(`📊 Data:`, data);
    } else {
      console.log(`❌ ERROR: ${response.status}`);
      console.log(`📝 Error:`, data);
    }
  } catch (error) {
    console.log(`💥 NETWORK ERROR:`, error.message);
  }
}

async function runTests() {
  console.log('🚀 DÉMARRAGE TESTS API FRONTEND');
  console.log('=' .repeat(50));

  // Test health gateway
  await testAPI('/health', 'Gateway Health Check');

  // Test BTP APIs (avec auth simulée)
  await testAPI('/api/btp/stats', 'BTP Stats');
  await testAPI('/api/btp/chantiers', 'BTP Chantiers');

  // Test Logistique APIs
  await testAPI('/api/logistique/produits', 'Logistique Produits');

  // Test Immigration APIs
  await testAPI('/api/immigration/clients', 'Immigration Clients');

  console.log('\n🏁 TESTS TERMINÉS');
}

// Exécuter si appelé directement
if (require.main === module) {
  runTests();
}

module.exports = { testAPI, runTests };