// Same rules as the backend (backend/src/utils/validators.js). Each returns an error message or ''.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const validateName = (v) =>
  v.trim().length < 20 || v.trim().length > 60 ? 'Name must be between 20 and 60 characters.' : '';

export const validateEmail = (v) => (EMAIL_REGEX.test(v.trim()) ? '' : 'Enter a valid email address.');

export const validateAddress = (v) => {
  if (v.trim().length === 0) return 'Address is required.';
  return v.length > 400 ? 'Address must be at most 400 characters.' : '';
};

export const validatePassword = (v) => {
  if (v.length < 8 || v.length > 16) return 'Password must be 8 to 16 characters.';
  if (!/[A-Z]/.test(v)) return 'Password must include at least one uppercase letter.';
  if (!/[^A-Za-z0-9]/.test(v)) return 'Password must include at least one special character.';
  return '';
};

// Runs { field: validatorFn } against the form values and returns { field: message } for failures.
export function validateForm(values, rules) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const message = rule(values[field] ?? '');
    if (message) errors[field] = message;
  }
  return errors;
}

export const formatRating = (value) => (value == null ? 'No ratings yet' : `${Number(value).toFixed(1)} / 5`);
