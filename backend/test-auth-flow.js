#!/usr/bin/env node

/**
 * 🧪 COMPLETE AUTHENTICATION FLOW TEST
 *
 * End-to-end test of:
 * 1. Registration (request-account endpoint)
 * 2. Database verification (user created with status='pending')
 * 3. Admin Login (get JWT token)
 * 4. Approval (approve endpoint)
 * 5. Database verification (password hashed, status='active')
 * 6. New User Login (verify password works)
 *
 * Usage: node backend/test-auth-flow.js [--email test@example.com] [--clean]
 */

const http = require('http');
const querystring = require('querystring');
require('dotenv').config({ path: './auth-service/.env' });
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || undefined;
const DB_NAME = process.env.DB_NAME || 'auth_db';
const API_URL = `http://localhost:${process.env.PORT || 3002}`;

const TEST_EMAIL = process.argv[2] === '--email' ? process.argv[3] : `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123@';
const ADMIN_EMAIL = 'admin@blg-engineering.com';
const ADMIN_PASSWORD = 'Blg1app23@';
const TEST_DEPT = 'voyage';

let adminToken = null;
let testUserId = null;

const db = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  charset: 'utf8mb4'
});

console.log('\n' + '='.repeat(80));
console.log('🧪 COMPLETE AUTHENTICATION FLOW TEST');
console.log('='.repeat(80) + '\n');

console.log('Configuration:');
console.log(`  API: ${API_URL}`);
console.log(`  Database: ${DB_NAME}@${DB_HOST}`);
console.log(`  Test Email: ${TEST_EMAIL}`);
console.log(`  Test Password: ${TEST_PASSWORD}\n`);

db.connect(err => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  start();
});

async function start() {
  try {
    console.log('📋 STEP 1: Register New User');
    console.log('-'.repeat(80));
    await step1_Register();

    console.log('\n📋 STEP 2: Verify User in Database');
    console.log('-'.repeat(80));
    await step2_VerifyPending();

    console.log('\n📋 STEP 3: Admin Login');
    console.log('-'.repeat(80));
    await step3_AdminLogin();

    console.log('\n📋 STEP 4: Approve User');
    console.log('-'.repeat(80));
    await step4_ApproveUser();

    console.log('\n📋 STEP 5: Verify User Updated in Database');
    console.log('-'.repeat(80));
    await step5_VerifyActive();

    console.log('\n📋 STEP 6: Test New User Login');
    console.log('-'.repeat(80));
    await step6_NewUserLogin();

    console.log('\n✅ ALL TESTS PASSED!\n');
    console.log('🎉 Authentication system is working correctly:\n');
    console.log('  ✅ Registration creates user with status="pending"');
    console.log('  ✅ Password stored as plaintext before approval');
    console.log('  ✅ Admin can approve pending users');
    console.log('  ✅ Approval hashes password and sets status="active"');
    console.log('  ✅ Users can login with hashed password');
    console.log('  ✅ Password verification works (bcrypt.compare)\n');

    cleanup();
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    cleanup();
    process.exit(1);
  }
}

function step1_Register() {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      nom: 'TestUser',
      prenom: 'TestFirst',
      telephone: '0123456789',
      poste: 'Tester',
      departement: TEST_DEPT
    });

    const options = {
      hostname: 'localhost',
      port: process.env.PORT || 3002,
      path: '/api/auth/request-account',
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
          if (response.success) {
            testUserId = response.user.id;
            console.log(`✅ Registration successful`);
            console.log(`   Email: ${response.user.email}`);
            console.log(`   ID: ${response.user.id}`);
            console.log(`   Status: ${response.user.status}`);
            resolve();
          } else {
            reject(new Error(response.error || 'Registration failed'));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function step2_VerifyPending() {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT id, email, status, password_hash, LENGTH(password_hash) as pwd_length FROM users WHERE email = ?',
      [TEST_EMAIL],
      (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return reject(new Error('User not found in database'));

        const user = results[0];
        console.log(`✅ User found in database`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Password: ${user.password_hash}`);
        console.log(`   Password Length: ${user.pwd_length}`);

        if (user.status !== 'pending') {
          return reject(new Error(`Expected status='pending', got '${user.status}'`));
        }

        if (user.password_hash !== TEST_PASSWORD) {
          return reject(new Error(`Expected plaintext password stored, got different value`));
        }

        console.log(`✅ Password is plaintext (not yet hashed)`);
        resolve();
      }
    );
  });
}

function step3_AdminLogin() {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      departement: 'DIRECTION'
    });

    const options = {
      hostname: 'localhost',
      port: process.env.PORT || 3002,
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
          if (response.success && response.token) {
            adminToken = response.token;
            console.log(`✅ Admin login successful`);
            console.log(`   Email: ${response.user.email}`);
            console.log(`   Role: ${response.user.role}`);
            console.log(`   Token: ${response.token.substring(0, 50)}...`);
            resolve();
          } else {
            reject(new Error(response.error || 'Login failed'));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function step4_ApproveUser() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: process.env.PORT || 3002,
      path: `/api/auth/users/${testUserId}/approve`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Length': 0
      },
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            console.log(`✅ User approval successful`);
            console.log(`   Email: ${response.user.email}`);
            console.log(`   Status: ${response.user.status}`);
            resolve();
          } else {
            reject(new Error(response.error || 'Approval failed'));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function step5_VerifyActive() {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT id, email, status, password_hash, password_hash LIKE "$2%" as is_bcrypt FROM users WHERE email = ?',
      [TEST_EMAIL],
      async (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return reject(new Error('User not found in database'));

        const user = results[0];
        console.log(`✅ User found in database`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Password Hash: ${user.password_hash.substring(0, 40)}...`);
        console.log(`   Is Bcrypt: ${user.is_bcrypt ? '✅ YES' : '❌ NO'}`);

        if (user.status !== 'active') {
          return reject(new Error(`Expected status='active', got '${user.status}'`));
        }

        if (!user.is_bcrypt) {
          return reject(new Error(`Expected bcrypt hash (starts with $2), got plaintext`));
        }

        // Test that the original password matches the hash
        try {
          const matches = await bcrypt.compare(TEST_PASSWORD, user.password_hash);
          if (!matches) {
            return reject(new Error('Password hash does not match original password!'));
          }
          console.log(`✅ Password verified (bcrypt.compare successful)`);
        } catch (err) {
          return reject(new Error(`Bcrypt error: ${err.message}`));
        }

        resolve();
      }
    );
  });
}

function step6_NewUserLogin() {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      departement: TEST_DEPT
    });

    const options = {
      hostname: 'localhost',
      port: process.env.PORT || 3002,
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
          if (response.success && response.token) {
            console.log(`✅ New user login successful`);
            console.log(`   Email: ${response.user.email}`);
            console.log(`   Role: ${response.user.role}`);
            console.log(`   Token: ${response.token.substring(0, 50)}...`);
            resolve();
          } else {
            reject(new Error(response.error || `Login failed: ${JSON.stringify(response)}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}\nResponse: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function cleanup() {
  db.end();
  console.log('Cleanup complete.\n');
  process.exit(0);
}
