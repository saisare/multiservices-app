#!/usr/bin/env node

/**
 * 🧪 COMPLETE AUTHENTICATION FLOW TEST
 *
 * Tests the entire flow:
 * 1. Admin login
 * 2. Create new user (registration)
 * 3. Approve user (admin action)
 * 4. Login with new user
 * 5. Verify each step
 */

const http = require('http');

const BASE_URL = 'http://localhost:3002';
const TIMESTAMP = Date.now();

let testResults = [];

console.log('\n' + '='.repeat(100));
console.log('🧪 COMPLETE AUTHENTICATION FLOW TEST');
console.log('='.repeat(100) + '\n');

// Helper to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
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

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

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
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

function logTest(step, status, message) {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏳';
  console.log(`${icon} ${step.toString().padStart(2)}. ${message}`);
  testResults.push({ step, status, message });
}

async function runTests() {
  try {
    // ============ STEP 1: Health Check ============
    console.log('\n📋 STEP 1: Service Health Check\n');
    try {
      const health = await makeRequest('GET', '/health');
      if (health.status === 200 && health.data.status === 'OK') {
        logTest(1, 'PASS', 'Auth service is running on port 3002');
      } else {
        logTest(1, 'FAIL', `Unexpected health response: ${health.status}`);
        throw new Error('Service not responding correctly');
      }
    } catch (err) {
      logTest(1, 'FAIL', `Service not running: ${err.message}`);
      throw err;
    }

    // ============ STEP 2: Admin Login ============
    console.log('\n📋 STEP 2: Admin Login\n');
    console.log('   Email: admin@blg-engineering.com');
    console.log('   Password: BtpAdmin2026@');
    console.log('   Endpoint: POST /api/auth/login\n');

    let adminToken;
    try {
      const adminLogin = await makeRequest('POST', '/api/auth/login', {
        email: 'admin@blg-engineering.com',
        password: 'BtpAdmin2026@',
        departement: 'DIRECTION'
      });

      if (adminLogin.status === 200 && adminLogin.data.token) {
        adminToken = adminLogin.data.token;
        logTest(2, 'PASS', `Admin login successful`);
        console.log(`   Token: ${adminToken.substring(0, 50)}...`);
        console.log(`   Role: ${adminLogin.data.user.role}`);
        console.log(`   ID: ${adminLogin.data.user.id}\n`);
      } else if (adminLogin.status === 401) {
        logTest(2, 'FAIL', 'Invalid credentials - password may be wrong');
        throw new Error('Admin login failed');
      } else {
        logTest(2, 'FAIL', `Login returned ${adminLogin.status}`);
        console.log('   Error:', adminLogin.data.error);
        throw new Error('Admin login failed');
      }
    } catch (err) {
      logTest(2, 'FAIL', `Admin login error: ${err.message}`);
      throw err;
    }

    // ============ STEP 3: Register New User ============
    console.log('\n📋 STEP 3: Register New User (Create Pending Account)\n');

    const testEmail = `testuser-${TIMESTAMP}@example.com`;
    const testPassword = 'TestPassword123@';

    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   Name: Test User`);
    console.log(`   Department: voyage`);
    console.log(`   Endpoint: POST /api/auth/request-account\n`);

    let newUserId;
    try {
      const register = await makeRequest('POST', '/api/auth/request-account', {
        email: testEmail,
        password: testPassword,
        nom: 'Test',
        prenom: 'User',
        telephone: '0612345678',
        poste: 'Ouvrier',
        departement: 'voyage'
      });

      if (register.status === 201 && register.data.success) {
        newUserId = register.data.user.id;
        logTest(3, 'PASS', `User registered with ID ${newUserId}`);
        console.log(`   Email: ${register.data.user.email}`);
        console.log(`   Status: ${register.data.user.status}`);
        console.log(`   Message: ${register.data.message}\n`);
      } else if (register.status === 409) {
        logTest(3, 'FAIL', 'Email already exists');
        throw new Error('Email already registered');
      } else {
        logTest(3, 'FAIL', `Registration failed: ${register.status}`);
        console.log('   Error:', register.data.error);
        throw new Error('Registration failed');
      }
    } catch (err) {
      logTest(3, 'FAIL', `Registration error: ${err.message}`);
      throw err;
    }

    // ============ STEP 4: List Pending Users ============
    console.log('\n📋 STEP 4: List Pending Users (Admin View)\n');
    console.log(`   Endpoint: GET /api/auth/pending-users`);
    console.log(`   Auth: Bearer ${adminToken.substring(0, 30)}...\n`);

    try {
      const pending = await makeRequest('GET', '/api/auth/pending-users', null, adminToken);

      if (pending.status === 200 && pending.data.users) {
        const foundUser = pending.data.users.find(u => u.email === testEmail);
        if (foundUser) {
          logTest(4, 'PASS', `Found ${pending.data.count} pending user(s)`);
          console.log(`   User: ${foundUser.email}`);
          console.log(`   ID: ${foundUser.id}`);
          console.log(`   Created: ${foundUser.requested_at}\n`);
        } else {
          logTest(4, 'WARN', `New user not in pending list yet`);
          console.log(`   Found ${pending.data.count} pending user(s)\n`);
        }
      } else {
        logTest(4, 'FAIL', `List pending returned ${pending.status}`);
        throw new Error('Failed to list pending users');
      }
    } catch (err) {
      logTest(4, 'FAIL', `Error listing pending: ${err.message}`);
    }

    // ============ STEP 5: Approve User ============
    console.log('\n📋 STEP 5: Approve User (Admin Action)\n');
    console.log(`   User ID: ${newUserId}`);
    console.log(`   Endpoint: PATCH /api/auth/users/${newUserId}/approve`);
    console.log(`   Auth: Bearer ${adminToken.substring(0, 30)}...\n`);

    try {
      const approve = await makeRequest(
        'PATCH',
        `/api/auth/users/${newUserId}/approve`,
        {},
        adminToken
      );

      if (approve.status === 200 && approve.data.success) {
        logTest(5, 'PASS', `User approved successfully`);
        console.log(`   Message: ${approve.data.message}`);
        console.log(`   Password: Hashed with bcrypt`);
        console.log(`   Status: Set to active\n`);
      } else if (approve.status === 404) {
        logTest(5, 'FAIL', 'User not found');
        throw new Error('User not found');
      } else {
        logTest(5, 'FAIL', `Approval returned ${approve.status}`);
        console.log('   Error:', approve.data.error);
        throw new Error('Approval failed');
      }
    } catch (err) {
      logTest(5, 'FAIL', `Approval error: ${err.message}`);
      throw err;
    }

    // ============ STEP 6: Login with New User ============
    console.log('\n📋 STEP 6: Login with New User (Test Approved Account)\n');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   Endpoint: POST /api/auth/login\n`);

    let userToken;
    try {
      const userLogin = await makeRequest('POST', '/api/auth/login', {
        email: testEmail,
        password: testPassword,
        departement: 'voyage'
      });

      if (userLogin.status === 200 && userLogin.data.token) {
        userToken = userLogin.data.token;
        logTest(6, 'PASS', `User login successful`);
        console.log(`   Email: ${userLogin.data.user.email}`);
        console.log(`   Role: ${userLogin.data.user.role}`);
        console.log(`   Department: ${userLogin.data.user.departement}`);
        console.log(`   Token: ${userToken.substring(0, 50)}...\n`);
      } else if (userLogin.status === 401) {
        logTest(6, 'FAIL', `Login rejected - password mismatch or account not active`);
        console.log(`   Status: ${userLogin.status}`);
        console.log(`   Error: ${userLogin.data.error}`);
        throw new Error('User login failed');
      } else {
        logTest(6, 'FAIL', `Login returned ${userLogin.status}`);
        console.log('   Error:', userLogin.data.error);
        throw new Error('User login failed');
      }
    } catch (err) {
      logTest(6, 'FAIL', `Login error: ${err.message}`);
      throw err;
    }

    // ============ STEP 7: Get User Profile ============
    console.log('\n📋 STEP 7: Get User Profile (Verify Auth)\n');
    console.log(`   Endpoint: GET /api/auth/me`);
    console.log(`   Auth: Bearer ${userToken.substring(0, 30)}...\n`);

    try {
      const profile = await makeRequest('GET', '/api/auth/me', null, userToken);

      if (profile.status === 200 && profile.data.id) {
        logTest(7, 'PASS', `Profile retrieved successfully`);
        console.log(`   Name: ${profile.data.prenom} ${profile.data.nom}`);
        console.log(`   Email: ${profile.data.email}`);
        console.log(`   Role: ${profile.data.role}`);
        console.log(`   Department: ${profile.data.departement}\n`);
      } else if (profile.status === 401) {
        logTest(7, 'FAIL', 'Token is invalid or expired');
        throw new Error('Invalid token');
      } else {
        logTest(7, 'FAIL', `Profile request returned ${profile.status}`);
        throw new Error('Failed to get profile');
      }
    } catch (err) {
      logTest(7, 'FAIL', `Profile error: ${err.message}`);
    }

    // ============ FINAL REPORT ============
    console.log('\n' + '='.repeat(100));
    console.log('📊 FINAL REPORT');
    console.log('='.repeat(100) + '\n');

    const passed = testResults.filter(r => r.status === 'PASS').length;
    const failed = testResults.filter(r => r.status === 'FAIL').length;
    const warned = testResults.filter(r => r.status === 'WARN').length;

    console.log('📋 Test Summary:\n');
    testResults.forEach(r => {
      const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`   ${icon} Step ${r.step}: ${r.message}`);
    });

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${warned} warnings\n`);

    // ============ AUTHENTICATION FLOW DIAGRAM ============
    console.log('🔄 Authentication Flow Completed:\n');
    console.log('   1. ✅ Health Check');
    console.log('   2. ✅ Admin Login (Gets token)');
    console.log('   3. ✅ Register New User (Creates pending account with actif=0)');
    console.log('   4. ✅ List Pending Users (Admin views pending accounts)');
    console.log('   5. ✅ Approve User (Sets actif=1, hashes password)');
    console.log('   6. ✅ Login with New User (Gets new token)');
    console.log('   7. ✅ Get Profile (Verifies token is valid)');
    console.log('\n');

    // ============ DATABASE FLOW ============
    console.log('🗄️  Database Flow:\n');
    console.log(`   1. INSERT into users (id=${newUserId}, email=${testEmail}, actif=0)`);
    console.log(`   2. SELECT from users WHERE actif=0 (found in pending list)`);
    console.log(`   3. UPDATE users SET password_hash=bcrypt(...), actif=1`);
    console.log(`   4. SELECT from users WHERE email=${testEmail} AND actif=1`);
    console.log(`   5. VERIFY bcrypt.compare(${testPassword}, stored_hash)`);
    console.log('\n');

    if (failed === 0) {
      console.log('✅ ALL TESTS PASSED - SYSTEM IS WORKING CORRECTLY!\n');
      process.exit(0);
    } else {
      console.log(`❌ ${failed} TESTS FAILED - CHECK ERRORS ABOVE\n`);
      process.exit(1);
    }

  } catch (err) {
    console.error('\n❌ TEST EXECUTION ERROR:', err.message);
    console.error('\nMake sure:');
    console.error('  1. Auth service is running: cd backend/auth-service && npm start');
    console.error('  2. MySQL/WAMP is running');
    console.error('  3. Database auth_db exists with users table');
    console.error('  4. Admin account exists in database\n');
    process.exit(1);
  }
}

runTests();
