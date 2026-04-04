#!/usr/bin/env node

/**
 * 🔧 PASSWORD AUTHENTICATION FIX SCRIPT
 *
 * This script fixes password authentication issues by:
 * 1. Checking database charset and collation
 * 2. Verifying password hashes
 * 3. Fixing corrupted passwords
 * 4. Re-hashing if necessary
 *
 * Usage: node backend/fix-passwords.js
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
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci'
});

console.log('\n🔧 PASSWORD AUTHENTICATION FIX\n');

db.connect(err => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database\n');

  // Step 1: Check charset
  console.log('📋 STEP 1: Checking database charset...\n');

  db.query(
    `SELECT
      TABLE_NAME,
      CHARACTER_SET_NAME,
      COLLATION_NAME
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('users', 'pending_users')`,
    [process.env.DB_NAME || 'auth_db'],
    async (err, results) => {
      if (err) {
        console.error('❌ Query failed:', err.message);
        process.exit(1);
      }

      let needsCharsetFix = false;

      results.forEach(row => {
        const charset = row.CHARACTER_SET_NAME;
        const collation = row.COLLATION_NAME;
        const isCorrect = charset === 'utf8mb4' && collation.includes('utf8mb4');

        console.log(`   ${row.TABLE_NAME}:`);
        console.log(`     Charset: ${charset} ${isCorrect ? '✅' : '❌ (should be utf8mb4)'}`);
        console.log(`     Collation: ${collation}`);

        if (!isCorrect) needsCharsetFix = true;
      });

      // Step 2: Fix charset if needed
      if (needsCharsetFix) {
        console.log('\n🔄 STEP 2: Fixing charset...\n');

        db.query(
          'ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
          (err) => {
            if (err) {
              console.error('❌ Failed to alter users table:', err.message);
            } else {
              console.log('   ✅ users table fixed');
            }

            db.query(
              'ALTER TABLE pending_users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
              (err) => {
                if (err) {
                  console.error('❌ Failed to alter pending_users table:', err.message);
                } else {
                  console.log('   ✅ pending_users table fixed\n');
                }

                checkPasswords();
              }
            );
          }
        );
      } else {
        console.log('   ✅ All tables have correct charset\n');
        checkPasswords();
      }
    }
  );

  // Step 3: Check and fix passwords
  async function checkPasswords() {
    console.log('📋 STEP 3: Checking password hashes...\n');

    db.query(
      'SELECT id, email, password_hash FROM users WHERE password_hash IS NOT NULL',
      async (err, users) => {
        if (err) {
          console.error('❌ Query failed:', err.message);
          process.exit(1);
        }

        console.log(`   Found ${users.length} users with passwords\n`);

        let fixedCount = 0;
        let errors = 0;

        for (const user of users) {
          console.log(`   Checking: ${user.email}`);
          const pwd = user.password_hash;

          // Check if it's a bcrypt hash
          if (pwd.startsWith('$2b$') || pwd.startsWith('$2a$')) {
            console.log(`     ✅ Already hashed (${pwd.substring(0, 30)}...)`);
          } else if (pwd.startsWith('$')) {
            // Starts with $ but not bcrypt
            console.log(`     ⚠️  Unusual password format`);
          } else {
            // Plaintext password - needs to be hashed
            console.log(`     ❌ PLAINTEXT detected - hashing...`);

            try {
              const salt = bcrypt.genSaltSync(10);
              const hashed = bcrypt.hashSync(pwd, salt);

              db.query(
                'UPDATE users SET password_hash = ? WHERE id = ?',
                [hashed, user.id],
                (err) => {
                  if (err) {
                    console.error(`       ❌ Update failed: ${err.message}`);
                    errors++;
                  } else {
                    console.log(`       ✅ Hashed: ${hashed.substring(0, 30)}...`);
                    fixedCount++;
                  }
                }
              );
            } catch (err) {
              console.error(`       ❌ Hash error: ${err.message}`);
              errors++;
            }
          }
        }

        // Wait for all updates to complete
        setTimeout(() => {
          console.log(`\n✅ Fixed ${fixedCount} passwords`);
          if (errors > 0) console.log(`⚠️  ${errors} errors occurred`);

          console.log('\n🔄 STEP 4: Verifying fixes...\n');

          db.query(
            'SELECT id, email, password_hash FROM users WHERE id IN (SELECT id FROM users LIMIT 5)',
            (err, sample) => {
              if (err) {
                console.error('❌ Query failed:', err.message);
              } else {
                sample.forEach(user => {
                  const isBcrypt = user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$');
                  console.log(`   ${user.email}: ${isBcrypt ? '✅ Bcrypt' : '⚠️  Plaintext'}`);
                });
              }

              console.log('\n✅ FIX COMPLETE\n');
              db.end();
            }
          );
        }, users.length * 100);
      }
    );
  }
});
