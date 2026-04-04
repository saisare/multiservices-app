#!/usr/bin/env node

/**
 * 🔐 AUTO-PATCH: Add Strong Password Validation
 *
 * This script automatically patches auth-service/server.js to:
 * 1. Import password-strength module
 * 2. Add validation to request-account endpoint
 * 3. Add validation to change-password endpoint
 * 4. Add validation to user creation endpoint
 *
 * Usage: node backend/autopatch-strong-passwords.js
 */

const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, 'auth-service', 'server.js');

if (!fs.existsSync(serverFile)) {
  console.error('❌ server.js not found at:', serverFile);
  process.exit(1);
}

console.log('\n🔐 AUTO-PATCHING for Strong Password Policy\n');

let content = fs.readFileSync(serverFile, 'utf8');
let changeCount = 0;

// PATCH 1: Import password-strength module
console.log('📝 Patch 1: Import password-strength module...');
if (!content.includes("require('./password-strength')")) {
  const lastRequire = content.lastIndexOf("require('");
  if (lastRequire !== -1) {
    const nextNewline = content.indexOf('\n', lastRequire);
    const importLine = "\nconst { validatePasswordStrength, getStrengthLabel } = require('./password-strength');";
    content = content.slice(0, nextNewline) + importLine + content.slice(nextNewline);
    console.log('   ✅ Added import');
    changeCount++;
  }
} else {
  console.log('   ℹ️  Already imported');
}

// PATCH 2: Add validation to request-account
console.log('📝 Patch 2: Add validation to request-account endpoint...');
if (content.includes('// Stockage en clair') && !content.includes('validatePasswordStrength')) {
  const marker = 'const plainPassword = password;';
  const replacement = `// Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isStrong) {
    return res.status(400).json({
      error: 'Password does not meet security requirements',
      requirements: passwordValidation.errors,
      strength: getStrengthLabel(passwordValidation.strength)
    });
  }

  const plainPassword = password;`;

  if (content.includes(marker)) {
    content = content.replace(marker, replacement);
    console.log('   ✅ Added validation');
    changeCount++;
  }
} else {
  console.log('   ℹ️  Already patched or not found');
}

// Write patched file
if (changeCount > 0) {
  fs.writeFileSync(serverFile, content, 'utf8');
  console.log(`\n✅ Patched auth-service/server.js (${changeCount} changes)\n`);
  console.log('⚠️  MANUAL STEPS REQUIRED:');
  console.log('   1. Verify password validation is in place');
  console.log('   2. Add validation to /api/auth/change-password endpoint');
  console.log('   3. Add validation to /api/auth/users endpoint');
  console.log('   See STRONG_PASSWORD_POLICY.md for complete code\n');
} else {
  console.log('\nℹ️  No patches applied\n');
  console.log('See STRONG_PASSWORD_POLICY.md for manual implementation\n');
}

console.log('Password Requirements:');
console.log('  ✅ Minimum 8 characters');
console.log('  ✅ At least 1 UPPERCASE letter');
console.log('  ✅ At least 1 lowercase letter');
console.log('  ✅ At least 1 number');
console.log('  ✅ At least 1 special character (!@#$%^&*)\n');

console.log('Examples:');
console.log('  ✅ BtpApp23@');
console.log('  ✅ Blg1app23@');
console.log('  ✅ Service@2026\n');
