#!/usr/bin/env node

/**
 * 🔧 RECREATE PENDING_USERS TABLE
 *
 * This script recreates the pending_users table that may have been deleted.
 * Run this ONCE to fix your database.
 *
 * Usage: node backend/recreate-pending-users.js
 */

require('dotenv').config({ path: './auth-service/.env' });
const mysql = require('mysql2');

console.log('\n🔧 RECREATING PENDING_USERS TABLE\n');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || 'auth_db',
  charset: 'utf8mb4'
});

db.connect(err => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database\n');

  // Check if table exists
  db.query(
    `SELECT TABLE_NAME FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'pending_users'`,
    [process.env.DB_NAME || 'auth_db'],
    (err, results) => {
      if (err) {
        console.error('❌ Query failed:', err.message);
        process.exit(1);
      }

      if (results.length > 0) {
        console.log('✅ ✓ PENDING_USERS table already exists');
        console.log('   No action needed\n');
        db.end();
        return;
      }

      console.log('⚠️  PENDING_USERS table NOT found - recreating...\n');

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
          console.error('❌ Create table failed:', err.message);
          process.exit(1);
        }

        console.log('✅ PENDING_USERS table created successfully!\n');
        console.log('   Structure:');
        console.log('   - id: INT (auto-increment)');
        console.log('   - email: VARCHAR(100) UNIQUE');
        console.log('   - nom, prenom: VARCHAR(100)');
        console.log('   - password_hash: VARCHAR(255)');
        console.log('   - status: ENUM(pending, approved, rejected)');
        console.log('   - departement: VARCHAR(100)');
        console.log('   - requested_at: TIMESTAMP');
        console.log('   - approved_at: TIMESTAMP NULL');
        console.log('   - processed_at: TIMESTAMP NULL\n');

        console.log('✅ You can now:');
        console.log('   1. Register new users via /api/auth/request-account');
        console.log('   2. Approve them via /api/auth/users/:id/approve');
        console.log('   3. Login with approved accounts\n');

        db.end();
      });
    }
  );
});
