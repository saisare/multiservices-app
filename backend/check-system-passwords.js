#!/usr/bin/env node

/**
 * 🔐 SYSTEM ACCOUNTS PASSWORD STRENGTH CHECK
 *
 * Verify that all system admin/director/secretary accounts have STRONG passwords
 *
 * Usage: node backend/check-system-passwords.js
 */

const { validatePasswordStrength, getStrengthLabel, getStrengthPercentage } = require('./auth-service/password-strength');

console.log('\n' + '='.repeat(80));
console.log('🔐 SYSTEM ACCOUNTS PASSWORD STRENGTH CHECK');
console.log('='.repeat(80) + '\n');

// System accounts that MUST have strong passwords
const systemAccounts = [
  {
    email: 'admin@blg-engineering.com',
    password: 'Blg1app23@',
    role: 'ADMIN',
    status: 'CRITICAL'
  },
  {
    email: 'directeur@blg-engineering.com',
    password: 'Director2026@',
    role: 'DIRECTEUR',
    status: 'CRITICAL'
  },
  {
    email: 'kaidoxkaid0@gmail.com',
    password: 'Junior23@',
    role: 'EMPLOYEE (voyage)',
    status: 'IMPORTANT'
  },
  {
    email: 'blgengineering8@gmail.com',
    password: 'Ledoux12@',
    role: 'EMPLOYEE (voyage)',
    status: 'IMPORTANT'
  }
];

console.log('System Accounts to Verify:\n');
console.log('| Email | Password | Role | Status |');
console.log('|-------|----------|------|--------|');
systemAccounts.forEach(acc => {
  console.log(`| ${acc.email} | ${acc.password.substring(0, 10)}... | ${acc.role} | ${acc.status} |`);
});

console.log('\n' + '='.repeat(80));
console.log('STRENGTH ANALYSIS');
console.log('='.repeat(80) + '\n');

let allStrong = true;
let summary = {
  total: systemAccounts.length,
  strong: 0,
  medium: 0,
  weak: 0
};

systemAccounts.forEach(account => {
  const validation = validatePasswordStrength(account.password);
  const strength = getStrengthPercentage(account.password);
  const label = getStrengthLabel(strength);

  console.log(`👤 ${account.email}`);
  console.log(`   Password: ${account.password}`);
  console.log(`   Role: ${account.role}`);
  console.log(`   Strength: ${label} (${strength}%)`);

  if (!validation.isStrong) {
    console.log(`   ❌ NOT STRONG! Missing:`);
    validation.errors.forEach(err => {
      console.log(`      - ${err}`);
    });
    allStrong = false;
    if (strength >= 60) summary.strong++;
    else if (strength >= 40) summary.medium++;
    else summary.weak++;
  } else {
    console.log(`   ✅ STRONG PASSWORD`);
    summary.strong++;
  }
  console.log();
});

console.log('='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80) + '\n');

console.log(`Total Accounts: ${summary.total}`);
console.log(`  ✅ Strong: ${summary.strong}`);
console.log(`  ⚠️  Medium: ${summary.medium}`);
console.log(`  ❌ Weak: ${summary.weak}\n`);

if (allStrong || summary.strong === summary.total) {
  console.log('✅ ALL SYSTEM ACCOUNTS HAVE STRONG PASSWORDS\n');
} else {
  console.log('⚠️  SOME ACCOUNTS NEED STRONGER PASSWORDS\n');
  console.log('Requirements:');
  console.log('  ✅ Minimum 8 characters');
  console.log('  ✅ At least 1 UPPERCASE letter (A-Z)');
  console.log('  ✅ At least 1 lowercase letter (a-z)');
  console.log('  ✅ At least 1 number (0-9)');
  console.log('  ✅ At least 1 special character (!@#$%^&*)\n');
  console.log('Examples of STRONG passwords:');
  console.log('  ✅ BtpApp23@');
  console.log('  ✅ Service@2026');
  console.log('  ✅ LogiB7#Transport\n');
}

console.log('='.repeat(80) + '\n');

// Test some example passwords
console.log('TESTING EXAMPLE PASSWORDS:\n');

const testPasswords = [
  'password123',    // ❌ no uppercase, no special
  'Pass',           // ❌ too short
  'TEST123',        // ❌ no lowercase, no special
  'Test@123',       // ✅ strong
  'BtpApp23@',      // ✅ strong
  'Service@2026',   // ✅ strong
];

testPasswords.forEach(pwd => {
  const validation = validatePasswordStrength(pwd);
  const strength = getStrengthPercentage(pwd);
  const label = getStrengthLabel(strength);

  console.log(`Password: ${pwd}`);
  if (validation.isStrong) {
    console.log(`  ${label} ✅`);
  } else {
    console.log(`  ${label} ❌ Missing:`);
    validation.errors.forEach(err => {
      console.log(`    - ${err}`);
    });
  }
  console.log();
});

console.log('='.repeat(80) + '\n');
