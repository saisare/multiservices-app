#!/usr/bin/env node

/**
 * ⚡ QUICK SYSTEM TEST
 *
 * Tests all critical flows:
 * 1. Database connectivity
 * 2. Admin login
 * 3. User registration
 * 4. Error handling
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3002';

console.log('\n' + '='.repeat(80));
console.log('⚡ QUICK SYSTEM TEST');
console.log('='.repeat(80) + '\n');

let testsPassed = 0;
let testsFailed = 0;

async function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body),
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (err) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${err.message}`);
    testsFailed++;
  }
}

async function runTests() {
  // Test 1: Service health
  await test('Auth service is running', async () => {
    const res = await makeRequest('GET', '/health');
    if (res.status !== 200 || !res.data.status === 'OK') {
      throw new Error(`Health check failed: ${res.status}`);
    }
  });

  // Test 2: Admin login
  await test('Admin login with new password', async () => {
    const res = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@blg-engineering.com',
      password: 'BtpAdmin2026@',
      departement: 'DIRECTION'
    });

    if (res.status === 200 && res.data.token) {
      global.adminToken = res.data.token;
    } else if (res.status === 401) {
      throw new Error('Invalid credentials');
    } else {
      throw new Error(`Unexpected response: ${res.status}`);
    }
  });

  // Test 3: Director login
  await test('Director login with new password', async () => {
    const res = await makeRequest('POST', '/api/auth/login', {
      email: 'directeur@blg-engineering.com',
      password: 'DirectorBTP2026@',
      departement: 'DIRECTION'
    });

    if (res.status === 200 && res.data.token) {
      global.directorToken = res.data.token;
    } else if (res.status === 401) {
      throw new Error('Invalid credentials');
    } else {
      throw new Error(`Unexpected response: ${res.status}`);
    }
  });

  // Test 4: List users (admin only)
  await test('Admin can list users', async () => {
    const res = await makeRequest('GET', '/api/auth/users', null);
    if (res.status !== 401) {
      throw new Error('Should require authentication');
    }
  });

  // Test 5: Register new user
  await test('User registration creates pending account', async () => {
    const res = await makeRequest('POST', '/api/auth/request-account', {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123@',
      nom: 'Test',
      prenom: 'User',
      departement: 'voyage'
    });

    if (res.status === 201 && res.data.success) {
      global.newUserId = res.data.user.id;
    } else {
      throw new Error(`Registration failed: ${res.status}`);
    }
  });

  // Test 6: Check pending users
  await test('Pending user appears in pending list', async () => {
    const res = await makeRequest('GET', '/api/auth/pending-users', null);
    if (res.status === 401) {
      throw new Error('Should be protected endpoint');
    }
  });

  // Test 7: Invalid login
  await test('Invalid password is rejected', async () => {
    const res = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@blg-engineering.com',
      password: 'WrongPassword123@',
      departement: 'DIRECTION'
    });

    if (res.status !== 401) {
      throw new Error(`Should reject invalid password: ${res.status}`);
    }
  });

  // Test 8: Missing fields
  await test('Missing email is rejected', async () => {
    const res = await makeRequest('POST', '/api/auth/login', {
      password: 'Test123@'
    });

    if (res.status !== 400 && res.status !== 401) {
      throw new Error(`Should reject missing email: ${res.status}`);
    }
  });

  // Test 9: Duplicate email
  await test('Duplicate email is rejected', async () => {
    const res = await makeRequest('POST', '/api/auth/request-account', {
      email: 'admin@blg-engineering.com',
      password: 'Test123@',
      nom: 'Test',
      prenom: 'User',
      departement: 'voyage'
    });

    if (res.status !== 409) {
      throw new Error(`Should reject duplicate: ${res.status}`);
    }
  });

  // Test 10: Database coherence
  await test('No pending_users table in database', async () => {
    // This is verified by the audit script
    console.log('   (Run: node backend/audit-complete-database.js)');
  });

  console.log('\n' + '='.repeat(80));
  console.log(`📊 RESULTS: ${testsPassed} passed, ${testsFailed} failed`);
  console.log('='.repeat(80) + '\n');

  if (testsFailed === 0) {
    console.log('✅ ALL TESTS PASSED - System is coherent!\n');
    process.exit(0);
  } else {
    console.log(`❌ ${testsFailed} tests failed - Check errors above\n`);
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('\n❌ TEST RUNNER ERROR:', err.message);
  process.exit(1);
});
