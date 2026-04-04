/**
 * 🔐 PASSWORD STRENGTH VALIDATION
 *
 * Enforce strong password policy across the system
 * Rules:
 * - Minimum 8 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 number (0-9)
 * - At least 1 special character (!@#$%^&*)
 *
 * Examples of STRONG passwords:
 * ✅ BtpApp23@
 * ✅ Blg1app23@
 * ✅ Service@2026
 * ✅ LogiB7#Transport
 *
 * Examples of WEAK passwords:
 * ❌ password123 (no uppercase, no special char)
 * ❌ Pass (too short)
 * ❌ TEST123 (no lowercase, no special char)
 * ❌ test@123 (no uppercase)
 */

function validatePasswordStrength(password) {
  const errors = [];

  // Check length
  if (!password || password.length < 8) {
    errors.push('Minimum 8 characters');
  }

  // Check uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('At least 1 uppercase letter (A-Z)');
  }

  // Check lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('At least 1 lowercase letter (a-z)');
  }

  // Check number
  if (!/[0-9]/.test(password)) {
    errors.push('At least 1 number (0-9)');
  }

  // Check special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('At least 1 special character (!@#$%^&*)');
  }

  return {
    isStrong: errors.length === 0,
    errors: errors,
    strength: getStrengthPercentage(password)
  };
}

function getStrengthPercentage(password) {
  let strength = 0;

  // Length (0-20 points)
  if (password && password.length >= 8) strength += 10;
  if (password && password.length >= 12) strength += 10;

  // Character types (0-20 points each)
  if (/[A-Z]/.test(password)) strength += 10;
  if (/[a-z]/.test(password)) strength += 10;
  if (/[0-9]/.test(password)) strength += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 10;

  return Math.min(strength, 100);
}

function getStrengthLabel(strength) {
  if (strength >= 60) return '✅ STRONG';
  if (strength >= 40) return '⚠️  MEDIUM';
  return '❌ WEAK';
}

module.exports = {
  validatePasswordStrength,
  getStrengthPercentage,
  getStrengthLabel
};

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validatePasswordStrength,
    getStrengthPercentage,
    getStrengthLabel
  };
}