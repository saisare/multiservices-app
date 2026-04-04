#!/usr/bin/env node

/**
 * 🔍 DATABASE INSPECTION TOOL
 *
 * Analyze current database structure in WAMP
 * - Check users table columns
 * - Check pending_users table
 * - Detect missing status column
 * - Generate migration SQL if needed
 */

require('dotenv').config({ path: './auth-service/.env' });
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || 'auth_db',
  charset: 'utf8mb4'
});

console.log('\n' + '='.repeat(80));
console.log('🔍 DATABASE STRUCTURE INSPECTION');
console.log('='.repeat(80) + '\n');

console.log('Configuration:');
console.log(`  Database: ${process.env.DB_NAME || 'auth_db'}`);
console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`  User: ${process.env.DB_USER || 'root'}\n`);

db.connect(err => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }

  console.log('✅ Connected\n');
  inspectUsersTable();
});

function inspectUsersTable() {
  console.log('📋 USERS TABLE COLUMNS');
  console.log('-'.repeat(80));

  db.query(
    `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
     ORDER BY ORDINAL_POSITION`,
    [process.env.DB_NAME || 'auth_db'],
    (err, columns) => {
      if (err) {
        console.error('❌ Error:', err.message);
        inspectPendingUsersTable();
        return;
      }

      if (!columns || columns.length === 0) {
        console.log('❌ Users table not found!\n');
        inspectPendingUsersTable();
        return;
      }

      console.log(`\nFound ${columns.length} columns:\n`);

      const hasStatusColumn = columns.some(c => c.COLUMN_NAME === 'status');

      columns.forEach(col => {
        const statusMarker = col.COLUMN_NAME === 'status' ? ' ⭐' : '';
        const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.COLUMN_DEFAULT ? ` DEFAULT '${col.COLUMN_DEFAULT}'` : '';
        console.log(`   ${col.COLUMN_NAME.padEnd(20)} ${col.COLUMN_TYPE.padEnd(25)} ${nullable}${defaultVal}${statusMarker}`);
      });

      if (!hasStatusColumn) {
        console.log('\n❌ STATUS COLUMN IS MISSING!');
        console.log('   This is why login fails with "Champ \'status\' inconnu dans where clause"');
        console.log('   See migration SQL below...\n');
      } else {
        console.log('\n✅ Status column exists\n');
      }

      inspectPendingUsersTable();
    }
  );
}

function inspectPendingUsersTable() {
  console.log('\n📋 PENDING_USERS TABLE');
  console.log('-'.repeat(80));

  db.query(
    `SELECT TABLE_NAME FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'pending_users'`,
    [process.env.DB_NAME || 'auth_db'],
    (err, results) => {
      if (err) {
        console.error('❌ Error:', err.message);
        inspectUserData();
        return;
      }

      if (results && results.length > 0) {
        console.log('\n⚠️  pending_users table EXISTS');
        console.log('   This should be dropped after migration to unified users table.\n');
      } else {
        console.log('\n✅ pending_users table does NOT exist');
        console.log('   Good - using unified users table\n');
      }

      inspectUserData();
    }
  );
}

function inspectUserData() {
  console.log('\n📋 USER DATA');
  console.log('-'.repeat(80));

  db.query(
    `SELECT
      COUNT(*) as total,
      COUNT(DISTINCT role) as roles,
      COUNT(DISTINCT departement) as departments
     FROM users`,
    (err, stats) => {
      if (err) {
        console.error('❌ Error:', err.message);
        showMigrationSQL();
        return;
      }

      console.log(`\nUsers in database: ${stats[0].total}`);
      console.log(`Distinct roles: ${stats[0].roles}`);
      console.log(`Distinct departments: ${stats[0].departments}\n`);

      db.query(
        `SELECT id, email, role, departement FROM users LIMIT 5`,
        (err, users) => {
          if (err) {
            console.error('❌ Error:', err.message);
            showMigrationSQL();
            return;
          }

          if (users && users.length > 0) {
            console.log('Sample users:');
            users.forEach(user => {
              console.log(`   ${user.email.padEnd(30)} Role: ${user.role?.padEnd(12) || 'NULL'} Dept: ${user.departement || 'NULL'}`);
            });
            console.log();
          }

          showMigrationSQL();
        }
      );
    }
  );
}

function showMigrationSQL() {
  console.log('\n' + '='.repeat(80));
  console.log('🔧 MIGRATION SQL');
  console.log('='.repeat(80) + '\n');

  console.log('To add status column (if missing), run this SQL in your database:\n');
  console.log('```sql');
  console.log('-- Add status column if it doesn\'t exist');
  console.log('ALTER TABLE users ADD COLUMN status ENUM(\'pending\', \'active\', \'rejected\')');
  console.log('DEFAULT \'active\' AFTER hidden;');
  console.log('```\n');

  console.log('Or in PhpMyAdmin:');
  console.log('1. Go to auth_db database');
  console.log('2. Click SQL tab');
  console.log('3. Paste the SQL above');
  console.log('4. Click Execute\n');

  showModifiedLoginCode();
}

function showModifiedLoginCode() {
  console.log('\n' + '='.repeat(80));
  console.log('⚙️  FIX FOR LOGIN ENDPOINT');
  console.log('='.repeat(80) + '\n');

  console.log('Modified login query (handles both with and without status column):\n');
  console.log('```javascript');
  console.log('// Login endpoint - works with or without status column');
  console.log('app.post(\'/api/auth/login\', async (req, res) => {');
  console.log('  const { email, password, departement } = req.body;');
  console.log('  if (!email || !password) return res.status(400).json({ error: \'Email et mot de passe requis\' });');
  console.log('');
  console.log('  let sql = \'SELECT * FROM users WHERE email = ? AND actif = 1 AND hidden = 0\';');
  console.log('  const params = [email];');
  console.log('');
  console.log('  // Try to add status check if column exists');
  console.log('  db.query(');
  console.log('    `SELECT COLUMN_NAME FROM information_schema.COLUMNS');
  console.log('     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = \'users\' AND COLUMN_NAME = \'status\'`,');
  console.log('    (err, statusExists) => {');
  console.log('      if (!err && statusExists && statusExists.length > 0) {');
  console.log('        sql += \' AND status = "active"\';');
  console.log('      }');
  console.log('');
  console.log('      if (departement) {');
  console.log('        sql += \' AND departement = ?\';');
  console.log('        params.push(departement);');
  console.log('      }');
  console.log('');
  console.log('      // ... rest of login logic');
  console.log('    }');
  console.log('  );');
  console.log('});');
  console.log('```\n');

  showQuickFix();
}

function showQuickFix() {
  console.log('='.repeat(80));
  console.log('⚡ QUICK FIX');
  console.log('='.repeat(80) + '\n');

  console.log('TEMPORARY FIX (remove status check from login):\n');
  console.log('In auth-service/server.js, change this line:\n');
  console.log('❌ BEFORE:');
  console.log('let sql = \'SELECT * FROM users WHERE email = ? AND actif = 1 AND hidden = 0 AND status = "active"\';');
  console.log('');
  console.log('✅ AFTER:');
  console.log('let sql = \'SELECT * FROM users WHERE email = ? AND actif = 1 AND hidden = 0\';');
  console.log('');
  console.log('This allows login WITHOUT status column (temporary fix).\n');

  finalize();
}

function finalize() {
  console.log('='.repeat(80) + '\n');

  db.end();
}
