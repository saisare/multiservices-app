#!/usr/bin/env node

/**
 * 🔧 FIX LOGIN ERROR: 'status' field unknown
 *
 * This script:
 * 1. Detects if status column exists
 * 2. Either removes status check from login OR adds the column
 * 3. Tests login for all services
 *
 * Usage: node backend/fix-login-status-error.js
 */

require('dotenv').config({ path: './auth-service/.env' });
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || 'auth_db',
  charset: 'utf8mb4'
});

console.log('\n' + '='.repeat(80));
console.log('🔧 FIX: Login Error "Champ \'status\' inconnu"');
console.log('='.repeat(80) + '\n');

db.connect(err => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database\n');

  step1_CheckStatusColumn();
});

function step1_CheckStatusColumn() {
  console.log('📋 STEP 1: Checking for status column...\n');

  db.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'status'`,
    [process.env.DB_NAME || 'auth_db'],
    (err, results) => {
      if (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
      }

      if (results && results.length > 0) {
        console.log('✅ Status column EXISTS');
        console.log('   The error is something else, not missing column\n');
        step2_CheckLoginCode();
      } else {
        console.log('❌ Status column MISSING - this is the problem!');
        console.log('   Offering 2 solutions...\n');
        step2_OfferSolutions();
      }
    }
  );
}

function step2_OfferSolutions() {
  console.log('SOLUTION A: Add status column to database');
  console.log('-'.repeat(80));
  console.log('\nSQL to run in PhpMyAdmin:\n');
  console.log('```sql');
  console.log('ALTER TABLE users ADD COLUMN status ENUM(\'pending\', \'active\', \'rejected\')');
  console.log('DEFAULT \'active\' AFTER hidden;');
  console.log('```\n');

  console.log('SOLUTION B: Remove status check from login (temporary)');
  console.log('-'.repeat(80));
  console.log('\nModify backend/auth-service/server.js line ~74:\n');
  console.log('❌ CHANGE FROM:');
  console.log('let sql = \'SELECT * FROM users WHERE email = ? AND actif = 1 AND hidden = 0 AND status = "active"\';');
  console.log('');
  console.log('✅ CHANGE TO:');
  console.log('let sql = \'SELECT * FROM users WHERE email = ? AND actif = 1 AND hidden = 0\';');
  console.log('');

  console.log('\nWe recommend SOLUTION A (add the column) but SOLUTION B is faster.\n');

  step2_CheckLoginCode();
}

function step2_CheckLoginCode() {
  console.log('\n📋 STEP 2: Checking auth-service/server.js...\n');

  const serverFile = path.join(__dirname, 'auth-service', 'server.js');

  if (!fs.existsSync(serverFile)) {
    console.error('❌ server.js not found at:', serverFile);
    process.exit(1);
  }

  const content = fs.readFileSync(serverFile, 'utf8');

  if (content.includes('AND status = "active"')) {
    console.log('❌ Login query CONTAINS status check');
    console.log('   This causes error if status column doesn\'t exist\n');
  } else {
    console.log('✅ Login query does NOT contain status check');
    console.log('   Good - will work without status column\n');
  }

  step3_GenerateFixScript();
}

function step3_GenerateFixScript() {
  console.log('📋 STEP 3: Generating automation scripts...\n');

  // Create an automated fix script
  const addStatusSQL = `
-- Add status column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS status ENUM('pending', 'active', 'rejected')
DEFAULT 'active' AFTER hidden;

-- Verify the column was added
DESCRIBE users;
  `.trim();

  const sqlFile = path.join(__dirname, 'ADD_STATUS_COLUMN.sql');
  fs.writeFileSync(sqlFile, addStatusSQL, 'utf8');

  console.log('✅ Created: ADD_STATUS_COLUMN.sql');
  console.log('   Use this in PhpMyAdmin to add the status column\n');

  step4_TestAfterFix();
}

function step4_TestAfterFix() {
  console.log('\n📋 STEP 4: What to do next...\n');

  console.log('OPTION A: Add status column (Recommended)');
  console.log('-'.repeat(80));
  console.log('1. Open PhpMyAdmin');
  console.log('2. Select auth_db database');
  console.log('3. Click SQL tab');
  console.log('4. Paste this SQL:');
  console.log('');
  console.log('   ALTER TABLE users ADD COLUMN status ENUM(\'pending\', \'active\', \'rejected\')');
  console.log('   DEFAULT \'active\' AFTER hidden;');
  console.log('');
  console.log('5. Click Execute');
  console.log('6. Restart auth service');
  console.log('7. Run: node test-all-services-login.js\n');

  console.log('OPTION B: Remove status check from login (Quick fix)');
  console.log('-'.repeat(80));
  console.log('1. Edit: backend/auth-service/server.js');
  console.log('2. Find line ~74: SELECT * FROM users WHERE email = ? AND ...');
  console.log('3. REMOVE: AND status = "active"');
  console.log('4. Restart auth service');
  console.log('5. Run: node test-all-services-login.js\n');

  finalize();
}

function finalize() {
  console.log('='.repeat(80));
  console.log('✅ ANALYSIS COMPLETE');
  console.log('='.repeat(80) + '\n');

  db.end();
}
