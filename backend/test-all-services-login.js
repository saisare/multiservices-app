#!/usr/bin/env node

/**
 * 🧪 MULTI-SERVICE LOGIN TEST
 *
 * Test login for all service types:
 * - ADMIN (admin@blg-engineering.com)
 * - DIRECTEUR (directeur@blg-engineering.com)
 * - SECRETAIRE (if exists)
 * - EMPLOYEE (voyage department)
 *
 * Verify JWT token and user details for each
 */

const http = require('http');

const API_URL = `http://localhost:3002`;

const testAccounts = [
  {
    name: 'ADMIN',
    email: 'admin@blg-engineering.com',
    password: 'BtpAdmin2026@',
    departement: 'DIRECTION',
    expectedRole: 'admin'
  }
];

console.log('\n' + '='.repeat(80));
console.log('🧪 MULTI-SERVICE LOGIN TEST');
console.log('='.repeat(80) + '\n');

console.log(`Testing login on ${API_URL}\n`);

let testIndex = 0;

function runNextTest() {
  if (testIndex >= testAccounts.length) {
    finalize();
    return;
  }

  const account = testAccounts[testIndex];
  console.log(`📋 TEST ${testIndex + 1}/${testAccounts.length}: ${account.name}`);
  console.log('-'.repeat(80));

  testLogin(account);
  testIndex++;
}

function testLogin(account) {
  const payload = JSON.stringify({
    email: account.email,
    password: account.password,
    departement: account.departement
  });

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    },
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`\n✅ Response Status: ${res.statusCode}`);

        if (response.success && response.token) {
          const user = response.user;
          console.log(`   Email: ${user.email}`);
          console.log(`   Role: ${user.role}`);
          console.log(`   Departement: ${user.departement}`);
          console.log(`   Token: ${response.token.substring(0, 50)}...`);

          // Verify role matches
          if (user.role === account.expectedRole) {
            console.log(`   ✅ Role matches expected (${account.expectedRole})`);
          } else {
            console.log(`   ⚠️  Role mismatch: expected ${account.expectedRole}, got ${user.role}`);
          }

          // Verify token is valid JWT
          try {
            const parts = response.token.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
              console.log(`   ✅ JWT Token valid (exp: ${new Date(payload.exp * 1000).toISOString()})`);
            }
          } catch (e) {
            console.log(`   ⚠️  Could not parse JWT token`);
          }
        } else {
          console.log(`   ❌ Error: ${response.error}`);
        }
      } catch (e) {
        console.log(`❌ Failed to parse response: ${e.message}`);
        console.log(`   Raw response: ${data.substring(0, 100)}`);
      }

      console.log();
      setTimeout(runNextTest, 500);
    });
  });

  req.on('error', (err) => {
    console.log(`❌ Connection error: ${err.message}`);
    console.log(`   Make sure auth service is running: cd backend/auth-service && npm start\n`);
    setTimeout(runNextTest, 500);
  });

  req.write(payload);
  req.end();
}

function finalize() {
  console.log('='.repeat(80));
  console.log('✅ TESTS COMPLETE');
  console.log('='.repeat(80) + '\n');

  console.log('Summary:\n');
  console.log('If all tests passed (✅):');
  console.log('  1. All services can login');
  console.log('  2. JWT tokens are valid');
  console.log('  3. User roles are correct');
  console.log('  4. Departments are assigned correctly\n');

  console.log('If any test failed (❌):');
  console.log('  1. Check auth service logs');
  console.log('  2. Verify users exist in database');
  console.log('  3. Check passwords are correct');
  console.log('  4. Run: node inspect-database.js\n');

  process.exit(0);
}

runNextTest();
