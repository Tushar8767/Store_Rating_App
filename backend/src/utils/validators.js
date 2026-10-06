// Validation rules from the challenge. The frontend has the same rules in its own utils/validators.js.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateName(name) {
  if (typeof name !== 'string' || name.trim().length < 20 || name.trim().length > 60) {
    return 'Name must be between 20 and 60 characters.';
  }
}

function validateEmail(email) {
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim()) || email.length > 255) {
    return 'Enter a valid email address.';
  }
}

function validateAddress(address) {
  if (typeof address !== 'string' || address.trim().length === 0) return 'Address is required.';
  if (address.length > 400) return 'Address must be at most 400 characters.';
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 16) {
    return 'Password must be 8 to 16 characters.';
  }
  if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include at least one special character.';
}

function validateRating(rating) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return 'Rating must be a whole number from 1 to 5.';
  }
}

// Keeps only the messages of checks that failed.
function collect(...results) {
  return results.filter(Boolean);
}

module.exports = {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  validateRating,
  collect,
};
