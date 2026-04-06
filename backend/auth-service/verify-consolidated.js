#!/usr/bin/env node

/**
 * 🧪 VERIFICATION SCRIPT FOR AUTH SERVICE
 *
 * Vérifie que le nouveau consolidated server.js
 * fonctionne correctement avec les données existantes
 */

const http = require('http');

const BASE_URL = 'http://localhost:3002';

function req(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    if(token) opts.headers.Authorization = `Bearer ${token}`;

    const r = http.request(opts, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch(e) { resolve({ status: res.statusCode, data: body }); }
      });
    });

    r.on('error', reject);
    r.setTimeout(5000, () => r.destroy());
    if(data) r.write(JSON.stringify(data));
    r.end();
  });
}

async function runTests() {
  console.log('\n' + '='.repeat(100));
  console.log('🧪 AUTH SERVICE VERIFICATION - NEW CONSOLIDATED SERVER.JS');
  console.log('='.repeat(100) + '\n');

  let token = null;
  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Health Check
  console.log('📋 Test 1: Health Check\n');
  try {
    const health = await req('GET', '/health');
    if(health.status === 200) {
      console.log('✅ Auth service is running on port 3002');
      testsPassed++;
    } else {
      console.log('❌ Unexpected response:', health.status);
      testsFailed++;
    }
  } catch(err) {
    console.log('❌ Service not running:', err.message);
    console.log('\n⚠️  Make sure to start the service first:');
    console.log('   cd backend/auth-service && npm start\n');
    process.exit(1);
  }

  // Test 2: Admin Login (with EXISTING data)
  console.log('\n📋 Test 2: Admin Login (Existing Data)\n');
  try {
    const login = await req('POST', '/api/auth/login', {
      email: 'admin@blg-engineering.com',
      password: 'BtpAdmin2026@',
      departement: 'DIRECTION'
    });

    if(login.status === 200 && login.data.token) {
      token = login.data.token;
      console.log(`✅ Admin login successful`);
      console.log(`   Email: ${login.data.user.email}`);
      console.log(`   Role: ${login.data.user.role}`);
      console.log(`   Token: ${token.substring(0, 40)}...`);
      testsPassed++;
    } else {
      console.log(`❌ Login failed: ${login.status}`);
      console.log(`   ${login.data.error}`);
      testsFailed++;
    }
  } catch(err) {
    console.log(`❌ Login error: ${err.message}`);
    testsFailed++;
  }

  // Test 3: List Pending Users
  if(token) {
    console.log('\n📋 Test 3: List Pending Users\n');
    try {
      const pending = await req('GET', '/api/auth/pending-users', null, token);
      if(pending.status === 200) {
        console.log(`✅ Pending users listed`);
        console.log(`   Count: ${pending.data.count}`);
        if(pending.data.users && pending.data.users.length > 0) {
          console.log(`   First user: ${pending.data.users[0].email}`);
        }
        testsPassed++;
      } else {
        console.log(`❌ List pending failed: ${pending.status}`);
        testsFailed++;
      }
    } catch(err) {
      console.log(`❌ Error: ${err.message}`);
      testsFailed++;
    }
  }

  // Test 4: Get Profile
  if(token) {
    console.log('\n📋 Test 4: Get User Profile\n');
    try {
      const profile = await req('GET', '/api/auth/me', null, token);
      if(profile.status === 200) {
        console.log(`✅ Profile retrieved`);
        console.log(`   Name: ${profile.data.prenom} ${profile.data.nom}`);
        console.log(`   Email: ${profile.data.email}`);
        console.log(`   Role: ${profile.data.role}`);
        testsPassed++;
      } else {
        console.log(`❌ Profile retrieval failed: ${profile.status}`);
        testsFailed++;
      }
    } catch(err) {
      console.log(`❌ Error: ${err.message}`);
      testsFailed++;
    }
  }

  // Test 5: Register New User
  console.log('\n📋 Test 5: Register New User (Password Validation)\n');
  const testEmail = `testuser-${Date.now()}@example.com`;
  try {
    const register = await req('POST', '/api/auth/request-account', {
      email: testEmail,
      password: 'StrongPass123@',
      nom: 'Test',
      prenom: 'User',
      telephone: '0612345678',
      poste: 'Ouvrier',
      departement: 'voyage'
    });

    if(register.status === 201) {
      console.log(`✅ User registered successfully`);
      console.log(`   Email: ${register.data.user.email}`);
      console.log(`   ID: ${register.data.user.id}`);
      console.log(`   Status: ${register.data.user.status}`);
      testsPassed++;
    } else {
      console.log(`❌ Registration failed: ${register.status}`);
      console.log(`   ${register.data.error}`);
      testsFailed++;
    }
  } catch(err) {
    console.log(`❌ Error: ${err.message}`);
    testsFailed++;
  }

  // Test 6: Reject Weak Password
  console.log('\n📋 Test 6: Weak Password Validation (Should Fail)\n');
  try {
    const weakPwd = await req('POST', '/api/auth/request-account', {
      email: 'weakpwd@example.com',
      password: 'password123',  // ❌ Weak!
      nom: 'Weak',
      prenom: 'Password',
      telephone: '0612345678',
      poste: 'Ouvrier',
      departement: 'voyage'
    });

    if(weakPwd.status === 400 && weakPwd.data.requirements) {
      console.log(`✅ Weak password correctly rejected`);
      console.log(`   Requirements not met:`);
      weakPwd.data.requirements.forEach(r => console.log(`     - ${r}`));
      testsPassed++;
    } else {
      console.log(`❌ Weak password validation not working`);
      console.log(`   Status: ${weakPwd.status}`);
      testsFailed++;
    }
  } catch(err) {
    console.log(`❌ Error: ${err.message}`);
    testsFailed++;
  }

  // Final Report
  console.log('\n' + '='.repeat(100));
  console.log('📊 VERIFICATION RESULTS');
  console.log('='.repeat(100) + '\n');

  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log();

  if(testsFailed === 0) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('\n✅ New consolidated server.js is working correctly!');
    console.log('✅ Existing data in database is intact');
    console.log('✅ Password validation working');
    console.log('✅ JWT authentication working\n');
    process.exit(0);
  } else {
    console.log('⚠️  SOME TESTS FAILED');
    console.log('\nCheck the errors above and fix the issues.\n');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('\n❌ Critical error:', err.message);
  process.exit(1);
});
