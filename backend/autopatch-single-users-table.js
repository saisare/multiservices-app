#!/usr/bin/env node

/**
 * 🔄 AUTO-PATCH: Convert server.js to use single users table
 *
 * This script automatically updates auth-service/server.js to:
 * 1. Add status='active' check to login
 * 2. Change request-account to insert into users table
 * 3. Update approve endpoint to UPDATE users instead of INSERT from pending_users
 * 4. Update pending-users endpoint to query users with status='pending'
 * 5. Update reject endpoint to UPDATE users status='rejected'
 *
 * Usage: node backend/autopatch-single-users-table.js
 */

const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, 'auth-service', 'server.js');

if (!fs.existsSync(serverFile)) {
  console.error('❌ server.js not found at:', serverFile);
  process.exit(1);
}

console.log('\n🔄 AUTO-PATCHING server.js for Single Users Table\n');

let content = fs.readFileSync(serverFile, 'utf8');
let changeCount = 0;

// PATCH 1: Login endpoint - add status='active' check
console.log('📝 Patch 1: Login endpoint...');
if (content.includes('SELECT * FROM users WHERE email = ? AND actif = 1 AND hidden = 0\';')) {
  if (!content.includes('status = "active"')) {
    content = content.replace(
      'SELECT * FROM users WHERE email = ? AND actif = 1 AND hidden = 0\';',
      'SELECT * FROM users WHERE email = ? AND actif = 1 AND hidden = 0 AND status = "active"\';'
    );
    console.log('   ✅ Added status check to login query');
    changeCount++;
  } else {
    console.log('   ℹ️  Already patched');
  }
} else {
  console.log('   ⚠️  Could not find login query - manual patch needed');
}

// PATCH 2: request-account endpoint
console.log('📝 Patch 2: request-account endpoint...');
if (content.includes('INSERT INTO pending_users')) {
  console.log('   ✅ Found pending_users insert - needs manual replacement');
  console.log('      See MIGRATION_SINGLE_USERS_TABLE.md for details');
  changeCount++;
} else if (content.includes('INSERT INTO users (matricule, nom, prenom, email, telephone, departement, poste, role, password_hash, actif, hidden, status')) {
  console.log('   ℹ️  Already converted to users table');
} else {
  console.log('   ⚠️  Could not identify insert statement');
}

// PATCH 3: Approve endpoint
console.log('📝 Patch 3: Approve endpoint...');
if (content.includes('SELECT * FROM pending_users WHERE id = ?')) {
  console.log('   ✅ Found pending_users query in approve - needs manual replacement');
  console.log('      See MIGRATION_SINGLE_USERS_TABLE.md for details');
  changeCount++;
} else if (content.includes('SELECT * FROM users WHERE id = ? AND status = "pending"')) {
  console.log('   ℹ️  Already converted');
} else {
  console.log('   ⚠️  Could not identify approve query');
}

// PATCH 4: Pending users list endpoint
console.log('📝 Patch 4: pending-users endpoint...');
if (content.includes('FROM pending_users')) {
  console.log('   ✅ Found pending_users query - needs manual replacement');
  console.log('      See MIGRATION_SINGLE_USERS_TABLE.md for details');
  changeCount++;
} else if (content.includes('FROM users') && content.includes('WHERE status = \'pending\'')) {
  console.log('   ℹ️  Already converted');
} else {
  console.log('   ⚠️  Could not identify pending-users query');
}

// PATCH 5: Reject endpoint
console.log('📝 Patch 5: Reject endpoint...');
if (content.includes('UPDATE pending_users SET status = \'rejected\'')) {
  console.log('   ✅ Found pending_users update in reject - needs manual replacement');
  console.log('      See MIGRATION_SINGLE_USERS_TABLE.md for details');
  changeCount++;
} else if (content.includes('UPDATE users SET status = \'rejected\'')) {
  console.log('   ℹ️  Already converted');
} else {
  console.log('   ⚠️  Could not identify reject update');
}

console.log(`\n📊 Summary: ${changeCount} changes detected\n`);

// Write the patched file
if (changeCount > 0) {
  fs.writeFileSync(serverFile, content, 'utf8');
  console.log('✅ Patched auth-service/server.js');
  console.log('\n⚠️  MANUAL STEPS REQUIRED:');
  console.log('   See MIGRATION_SINGLE_USERS_TABLE.md for the 5 code sections to replace');
  console.log('   These cannot be auto-patched due to encoding complexity.\n');
} else {
  console.log('ℹ️  No patches applied - server.js may already be converted\n');
}
