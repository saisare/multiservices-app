#!/usr/bin/env node

/**
 * 🚀 QUICK RECOVERY SCRIPT
 *
 * This script fixes the most common issues in one go:
 * 1. Recreates pending_users table (if deleted)
 * 2. Fixes database charset to utf8mb4
 * 3. Rehashes plaintext passwords
 * 4. Verifies the complete setup
 *
 * Usage: node backend/recover-auth-system.js
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

console.log('\n🚀 AUTHENTICATION SYSTEM RECOVERY\n');
console.log('This script will:');
console.log('  1. Recreate pending_users table (if deleted)');
console.log('  2. Fix database charset to utf8mb4');
console.log('  3. Rehash plaintext passwords');
console.log('  4. Verify the setup\n');

let step = 1;

db.connect(err => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  console.log(`✅ Step 1: Connected to database (${process.env.DB_NAME})\n`);

  step2_CheckPendingUsersTable();
});

function step2_CheckPendingUsersTable() {
  console.log('📋 Step 2: Checking pending_users table...\n');

  db.query(
    `SELECT TABLE_NAME FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'pending_users'`,
    [process.env.DB_NAME || 'auth_db'],
    (err, results) => {
      if (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
      }

      if (results.length > 0) {
        console.log('   ✅ pending_users table already exists\n');
        step3_FixCharset();
      } else {
        console.log('   ⚠️  pending_users table NOT found - recreating...\n');

        const createTableSQL = `
          CREATE TABLE pending_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(100) UNIQUE NOT NULL,
            nom VARCHAR(100) NOT NULL,
            prenom VARCHAR(100) NOT NULL,
            telephone VARCHAR(20),
            poste VARCHAR(100),
            departement VARCHAR(100) NOT NULL,
            password_hash VARCHAR(255),
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            approved_at TIMESTAMP NULL,
            approved_by INT,
            rejection_reason TEXT,
            processed_at TIMESTAMP NULL,
            processed_by INT,
            INDEX (email),
            INDEX (status),
            INDEX (departement)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        db.query(createTableSQL, (err) => {
          if (err) {
            console.error('❌ Failed to create table:', err.message);
            process.exit(1);
          }
          console.log('   ✅ pending_users table created successfully\n');
          step3_FixCharset();
        });
      }
    }
  );
}

function step3_FixCharset() {
  console.log('📋 Step 3: Fixing database charset...\n');

  db.query(
    `SELECT TABLE_NAME, CHARACTER_SET_NAME FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('users', 'pending_users')`,
    [process.env.DB_NAME || 'auth_db'],
    (err, results) => {
      if (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
      }

      let needsFix = false;
      results.forEach(row => {
        const ok = row.CHARACTER_SET_NAME === 'utf8mb4';
        const status = ok ? '✅' : '❌';
        console.log(`   ${status} ${row.TABLE_NAME}: ${row.CHARACTER_SET_NAME}`);
        if (!ok) needsFix = true;
      });

      if (!needsFix) {
        console.log('\n   ✅ All tables have correct charset\n');
        step4_FixPasswords();
      } else {
        console.log('\n   🔧 Fixing charset...\n');

        db.query(
          'ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
          (err) => {
            if (err) console.error('   ❌ Error fixing users table:', err.message);
            else console.log('      ✅ users table fixed');

            db.query(
              'ALTER TABLE pending_users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
              (err) => {
                if (err) console.error('   ❌ Error fixing pending_users table:', err.message);
                else console.log('      ✅ pending_users table fixed\n');
                step4_FixPasswords();
              }
            );
          }
        );
      }
    }
  );
}

function step4_FixPasswords() {
  console.log('📋 Step 4: Fixing plaintext passwords...\n');

  db.query(
    `SELECT id, email, password_hash FROM users
     WHERE password_hash IS NOT NULL
     AND password_hash NOT LIKE '$2%'
     AND LENGTH(password_hash) < 100`,
    async (err, plaintextUsers) => {
      if (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
      }

      if (plaintextUsers.length === 0) {
        console.log('   ✅ No plaintext passwords found\n');
        step5_Verify();
        return;
      }

      console.log(`   Found ${plaintextUsers.length} plaintext password(s) - hashing...\n`);

      let fixedCount = 0;
      let errorCount = 0;

      for (const user of plaintextUsers) {
        try {
          const salt = bcrypt.genSaltSync(10);
          const hashed = bcrypt.hashSync(user.password_hash, salt);

          db.query(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [hashed, user.id],
            (err) => {
              if (err) {
                console.log(`      ❌ ${user.email}: ${err.message}`);
                errorCount++;
              } else {
                console.log(`      ✅ ${user.email}: hashed`);
                fixedCount++;
              }

              if (fixedCount + errorCount === plaintextUsers.length) {
                console.log(`\n   ✅ Fixed ${fixedCount} password(s)\n`);
                step5_Verify();
              }
            }
          );
        } catch (err) {
          console.log(`      ❌ ${user.email}: ${err.message}`);
          errorCount++;
        }
      }
    }
  );
}

function step5_Verify() {
  console.log('📋 Step 5: Verifying setup...\n');

  // Check tables exist
  db.query(
    `SELECT TABLE_NAME FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('users', 'pending_users')`,
    [process.env.DB_NAME || 'auth_db'],
    (err, tables) => {
      if (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
      }

      console.log(`   ✅ Tables exist: ${tables.map(t => t.TABLE_NAME).join(', ')}`);

      // Check sample users
      db.query(
        'SELECT COUNT(*) as count FROM users',
        (err, results) => {
          if (err) {
            console.error('❌ Error:', err.message);
            process.exit(1);
          }

          console.log(`   ✅ Users in database: ${results[0].count}`);

          // Check charset
          db.query(
            `SELECT CHARACTER_SET_NAME FROM information_schema.TABLES
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`,
            [process.env.DB_NAME || 'auth_db'],
            (err, results) => {
              if (err) {
                console.error('❌ Error:', err.message);
                process.exit(1);
              }

              const charset = results[0].CHARACTER_SET_NAME;
              console.log(`   ✅ Database charset: ${charset}`);

              // Check password hashes
              db.query(
                `SELECT
                  SUM(CASE WHEN password_hash LIKE '$2%' THEN 1 ELSE 0 END) as hashed_count,
                  SUM(CASE WHEN password_hash NOT LIKE '$2%' AND LENGTH(password_hash) < 100 THEN 1 ELSE 0 END) as plaintext_count,
                  COUNT(*) as total_count
                FROM users`,
                (err, results) => {
                  if (err) {
                    console.error('❌ Error:', err.message);
                    process.exit(1);
                  }

                  const { hashed_count, plaintext_count, total_count } = results[0] || {};
                  console.log(`   ✅ Password hashes: ${hashed_count || 0} bcrypt, ${plaintext_count || 0} plaintext, ${total_count || 0} total\n`);

                  console.log('✅ RECOVERY COMPLETE!\n');
                  console.log('You can now:');
                  console.log('  1. Register new users via /api/auth/request-account');
                  console.log('  2. Approve them via /api/auth/users/:id/approve');
                  console.log('  3. Login with approved accounts\n');

                  db.end();
                }
              );
            }
          );
        }
      );
    }
  );
}
