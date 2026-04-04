#!/usr/bin/env node

/**
 * 🔐 ADMIN PASSWORD VERIFICATION & RESET
 *
 * Check if admin password matches the hash in database
 * If not, reset it to a new strong password
 */

require('dotenv').config({ path: './auth-service/.env' });
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || 'auth_db',
  charset: 'utf8mb4'
});

console.log('\n' + '='.repeat(80));
console.log('🔐 ADMIN & DIRECTOR PASSWORD VERIFICATION');
console.log('='.repeat(80) + '\n');

db.connect(err => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }

  checkAdminPassword();
});

async function checkAdminPassword() {
  console.log('📋 Checking ADMIN account...\n');

  db.query(
    'SELECT id, email, role, password_hash FROM users WHERE email = "admin@blg-engineering.com"',
    async (err, results) => {
      if (err) {
        console.error('❌ Query error:', err.message);
        process.exit(1);
      }

      if (!results || results.length === 0) {
        console.log('❌ Admin user NOT found!');
        process.exit(1);
      }

      const admin = results[0];
      const testPassword = 'Blg1app23@';

      console.log(`Email: ${admin.email}`);
      console.log(`Role: ${admin.role}`);
      console.log(`Hash: ${admin.password_hash.substring(0, 40)}...\n`);

      try {
        const matches = await bcrypt.compare(testPassword, admin.password_hash);

        console.log(`Testing password: "${testPassword}"`);
        console.log(`Match result: ${matches ? '✅ YES' : '❌ NO'}\n`);

        if (!matches) {
          console.log('⚠️  PASSWORD MISMATCH!');
          console.log('   The stored hash does NOT match "Blg1app23@"');
          console.log('');
          await resetAdminPassword();
        } else {
          console.log('✅ PASSWORD MATCHES!');
          console.log('   The password should work for login\n');
          checkDirectorPassword();
        }
      } catch (err) {
        console.error('❌ Bcrypt error:', err.message);
        process.exit(1);
      }
    }
  );
}

async function resetAdminPassword() {
  console.log('🔧 RESETTING ADMIN PASSWORD...\n');

  const newPassword = 'Blg1app23@';
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(newPassword, salt);

  db.query(
    'UPDATE users SET password_hash = ? WHERE email = "admin@blg-engineering.com"',
    [hashedPassword],
    (err) => {
      if (err) {
        console.error('❌ Update failed:', err.message);
        process.exit(1);
      }

      console.log(`✅ Admin password reset to: "${newPassword}"`);
      console.log(`   Hash: ${hashedPassword.substring(0, 50)}...\n`);

      checkDirectorPassword();
    }
  );
}

function checkDirectorPassword() {
  console.log('\n📋 Checking DIRECTEUR account...\n');

  db.query(
    'SELECT id, email, role, password_hash FROM users WHERE email = "directeur@blg-engineering.com"',
    async (err, results) => {
      if (err) {
        console.error('❌ Query error:', err.message);
        process.exit(1);
      }

      if (!results || results.length === 0) {
        console.log('⚠️  Directeur user NOT found');
        showSummary();
        return;
      }

      const directeur = results[0];
      const testPassword = 'Director2026@';

      console.log(`Email: ${directeur.email}`);
      console.log(`Role: ${directeur.role}`);
      console.log(`Hash: ${directeur.password_hash.substring(0, 40)}...\n`);

      try {
        const matches = await bcrypt.compare(testPassword, directeur.password_hash);

        console.log(`Testing password: "${testPassword}"`);
        console.log(`Match result: ${matches ? '✅ YES' : '❌ NO'}\n`);

        if (!matches) {
          console.log('⚠️  PASSWORD MISMATCH!');
          await resetDirectorPassword();
        } else {
          console.log('✅ PASSWORD MATCHES!\n');
          showSummary();
        }
      } catch (err) {
        console.error('❌ Bcrypt error:', err.message);
        process.exit(1);
      }
    }
  );
}

async function resetDirectorPassword() {
  console.log('🔧 RESETTING DIRECTEUR PASSWORD...\n');

  const newPassword = 'Director2026@';
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(newPassword, salt);

  db.query(
    'UPDATE users SET password_hash = ? WHERE email = "directeur@blg-engineering.com"',
    [hashedPassword],
    (err) => {
      if (err) {
        console.error('❌ Update failed:', err.message);
        process.exit(1);
      }

      console.log(`✅ Directeur password reset to: "${newPassword}"`);
      console.log(`   Hash: ${hashedPassword.substring(0, 50)}...\n`);

      showSummary();
    }
  );
}

function showSummary() {
  console.log('\n' + '='.repeat(80));
  console.log('✅ SYSTEM ACCOUNTS VERIFIED');
  console.log('='.repeat(80) + '\n');

  console.log('Now test login with curl:\n');
  console.log('```bash');
  console.log('curl -X POST http://localhost:3002/api/auth/login \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{');
  console.log('    "email": "admin@blg-engineering.com",');
  console.log('    "password": "Blg1app23@",');
  console.log('    "departement": "DIRECTION"');
  console.log('  }\'');
  console.log('```\n');

  db.end();
}
