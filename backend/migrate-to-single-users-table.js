#!/usr/bin/env node

/**
 * 🔄 MIGRATE TO SINGLE USERS TABLE
 *
 * This removes pending_users and consolidates everything into users table.
 * - Adds status column to users (pending/active/rejected)
 * - Migration: moves pending_users data to users
 * - Drops pending_users table
 *
 * Usage: node backend/migrate-to-single-users-table.js
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

console.log('\n🔄 MIGRATION: pending_users → users (single table)\n');

db.connect(err => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database\n');

  step1_AddStatusColumn();
});

function step1_AddStatusColumn() {
  console.log('📋 Step 1: Adding status column to users table...\n');

  db.query(
    `ALTER TABLE users ADD COLUMN status ENUM('pending', 'active', 'rejected')
     DEFAULT 'active' AFTER actif`,
    (err) => {
      if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log('   ✅ Status column already exists\n');
          step2_MigratePendingUsers();
        } else {
          console.error('❌ Error:', err.message);
          process.exit(1);
        }
      } else {
        console.log('   ✅ Status column added to users table\n');
        step2_MigratePendingUsers();
      }
    }
  );
}

function step2_MigratePendingUsers() {
  console.log('📋 Step 2: Migrating pending_users to users...\n');

  // Check if pending_users exists
  db.query(
    `SELECT TABLE_NAME FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'pending_users'`,
    [process.env.DB_NAME || 'auth_db'],
    (err, results) => {
      if (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
      }

      if (results.length === 0) {
        console.log('   ✅ pending_users table does not exist (already migrated)\n');
        step3_VerifyData();
        return;
      }

      console.log('   Found pending_users table - migrating data...\n');

      // Get all pending users
      db.query(
        `SELECT id, email, nom, prenom, telephone, poste, departement, password_hash, status
         FROM pending_users`,
        (err, pendingUsers) => {
          if (err) {
            console.error('❌ Error reading pending_users:', err.message);
            process.exit(1);
          }

          if (pendingUsers.length === 0) {
            console.log('   ℹ️  No pending users to migrate\n');
            step3_VerifyData();
            return;
          }

          console.log(`   Found ${pendingUsers.length} pending user(s)\n`);

          let migratedCount = 0;
          let skipCount = 0;

          pendingUsers.forEach(pendingUser => {
            // Check if user already exists in users table
            db.query(
              'SELECT id FROM users WHERE email = ?',
              [pendingUser.email],
              (err, results) => {
                if (err) {
                  console.error(`❌ ${pendingUser.email}: ${err.message}`);
                  return;
                }

                if (results.length > 0) {
                  console.log(`   ⏭️  ${pendingUser.email}: already in users table (skipped)`);
                  skipCount++;
                } else {
                  // Insert into users table with status='pending'
                  db.query(
                    `INSERT INTO users (matricule, nom, prenom, email, telephone, departement, poste, role, password_hash, actif, hidden, verified, status, date_creation)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0, ?, NOW())`,
                    [
                      `USR-PENDING-${pendingUser.id}`,
                      pendingUser.nom,
                      pendingUser.prenom,
                      pendingUser.email,
                      pendingUser.telephone || null,
                      pendingUser.departement,
                      pendingUser.poste || null,
                      'employee',
                      pendingUser.password_hash || '',
                      pendingUser.status === 'approved' ? 'active' : pendingUser.status || 'pending'
                    ],
                    (err) => {
                      if (err) {
                        console.log(`   ❌ ${pendingUser.email}: ${err.message}`);
                      } else {
                        console.log(`   ✅ ${pendingUser.email}: migrated (status: ${pendingUser.status})`);
                        migratedCount++;
                      }

                      // After all migrations, go to next step
                      if (migratedCount + skipCount === pendingUsers.length) {
                        console.log(`\n   Result: ${migratedCount} migrated, ${skipCount} skipped\n`);
                        step3_VerifyData();
                      }
                    }
                  );
                }
              }
            );
          });
        }
      );
    }
  );
}

function step3_VerifyData() {
  console.log('📋 Step 3: Verifying data integrity...\n');

  db.query(
    `SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
     FROM users`,
    (err, results) => {
      if (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
      }

      const stats = results[0];
      console.log(`   Total users: ${stats.total}`);
      console.log(`   Pending: ${stats.pending_count}`);
      console.log(`   Active: ${stats.active_count}`);
      console.log(`   Rejected: ${stats.rejected_count}\n`);

      step4_DropPendingUsersTable();
    }
  );
}

function step4_DropPendingUsersTable() {
  console.log('📋 Step 4: Removing pending_users table...\n');

  db.query(
    `DROP TABLE IF EXISTS pending_users`,
    (err) => {
      if (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
      }

      console.log('   ✅ pending_users table dropped\n');
      step5_ShowNewSchema();
    }
  );
}

function step5_ShowNewSchema() {
  console.log('📋 Step 5: New table structure...\n');

  db.query(
    `DESCRIBE users`,
    (err, columns) => {
      if (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
      }

      console.log('   Users table columns:');
      columns.forEach(col => {
        console.log(`     - ${col.Field}: ${col.Type}`);
      });

      console.log('\n✅ MIGRATION COMPLETE!\n');
      console.log('New flow:');
      console.log('  1. User registers → INSERT users (status="pending")');
      console.log('  2. Admin approves → UPDATE users SET status="active"');
      console.log('  3. User login → SELECT FROM users WHERE status="active"\n');

      db.end();
    }
  );
}
