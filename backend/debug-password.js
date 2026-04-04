#!/usr/bin/env node

/**
 * 🔐 PASSWORD AUTHENTICATION DEBUG SCRIPT
 *
 * This script diagnoses password mismatch issues in the registration→approval→login flow
 * Run this AFTER you've:
 * 1. Registered a new user
 * 2. Approved the account
 * 3. Tried to login (and it failed)
 *
 * Usage: node backend/debug-password.js <user_email>
 * Example: node backend/debug-password.js testuser@example.com
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

const userEmail = process.argv[2];

if (!userEmail) {
  console.error('❌ Usage: node debug-password.js <email>');
  process.exit(1);
}

console.log(`\n🔍 Debugging password for: ${userEmail}\n`);

db.connect(err => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database\n');

  // Step 1: Get pending user (plaintext password)
  db.query(
    'SELECT id, email, password_hash FROM pending_users WHERE email = ?',
    [userEmail],
    async (err, pendingResults) => {
      if (err) {
        console.error('❌ Query failed:', err.message);
        process.exit(1);
      }

      if (!pendingResults.length) {
        console.log('⚠️  No pending user found with this email');
      } else {
        const pending = pendingResults[0];
        console.log('📋 PENDING_USERS TABLE:');
        console.log(`   Email: ${pending.email}`);
        console.log(`   Password (plaintext): "${pending.password_hash}"`);
        console.log(`   Password length: ${pending.password_hash.length}`);
        console.log(`   Password hex: ${Buffer.from(pending.password_hash).toString('hex')}`);
        console.log(`   Starts with $2? ${pending.password_hash.startsWith('$2')}`);
      }

      // Step 2: Get approved user (hashed password)
      db.query(
        'SELECT id, email, password_hash, role FROM users WHERE email = ?',
        [userEmail],
        async (err, userResults) => {
          if (err) {
            console.error('❌ Query failed:', err.message);
            process.exit(1);
          }

          if (!userResults.length) {
            console.log('\n⚠️  No user found - account not yet approved!');
          } else {
            const user = userResults[0];
            console.log('\n📋 USERS TABLE:');
            console.log(`   Email: ${user.email}`);
            console.log(`   Password (stored): "${user.password_hash}"`);
            console.log(`   Password length: ${user.password_hash.length}`);
            console.log(`   Starts with $2b$? ${user.password_hash.startsWith('$2b$')}`);
            console.log(`   Role: ${user.role}`);

            if (!pendingResults.length) {
              console.log('\n⚠️  Cannot test because pending user not found');
            } else {
              // Step 3: Test if original password matches the hash
              const plainPassword = pendingResults[0].password_hash;
              const storedHash = user.password_hash;

              console.log('\n🧪 PASSWORD COMPARISON TEST:');
              console.log(`   Testing: bcrypt.compare("${plainPassword}", "${storedHash.substring(0, 20)}...")`);

              try {
                const matches = await bcrypt.compare(plainPassword, storedHash);
                if (matches) {
                  console.log(`   ✅ MATCH! Password is correct`);
                } else {
                  console.log(`   ❌ NO MATCH! Password mismatch detected`);
                  console.log('\n   💡 Possible causes:');
                  console.log('      1. Password was corrupted during registration');
                  console.log('      2. UTF-8 encoding issue in database');
                  console.log('      3. Password field truncation');
                  console.log('      4. Special characters not stored correctly');
                }
              } catch (err) {
                console.log(`   ❌ ERROR: ${err.message}`);
              }

              // Step 4: Test by re-hashing the plaintext password
              console.log('\n🔐 RE-HASHING TEST (to verify bcrypt works):');
              try {
                const salt = bcrypt.genSaltSync(10);
                const rehashed = bcrypt.hashSync(plainPassword, salt);
                console.log(`   Re-hashed password: "${rehashed.substring(0, 30)}..."`);

                const rehashMatches = await bcrypt.compare(plainPassword, rehashed);
                if (rehashMatches) {
                  console.log(`   ✅ RE-HASH matches original password`);
                  console.log('\n   💡 This means:');
                  console.log('      - Bcrypt is working correctly');
                  console.log('      - The plaintext password is valid');
                  console.log('      - The stored hash in users table is WRONG');
                } else {
                  console.log(`   ❌ RE-HASH does NOT match`);
                  console.log('      This is very unusual - bcrypt is broken');
                }
              } catch (err) {
                console.log(`   ❌ ERROR: ${err.message}`);
              }

              // Step 5: Character-by-character comparison
              if (pendingResults.length) {
                console.log('\n📊 CHARACTER ANALYSIS:');
                const plainPwd = pendingResults[0].password_hash;
                console.log(`   Plain password: "${plainPwd}"`);
                console.log(`   Characters: ${Array.from(plainPwd).map((c, i) => `${i}:'${c}'(${c.charCodeAt(0)})`).join(', ')}`);
              }
            }
          }

          db.end();
          console.log('\n✅ Debug complete\n');
        }
      );
    }
  );
});
