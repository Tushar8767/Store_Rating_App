const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const HttpError = require('../utils/HttpError');
const v = require('../utils/validators');

// Used by all three roles. Always changes the password of the logged-in user only.
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (typeof currentPassword !== 'string') throw new HttpError(400, 'Current password is required.');

  const errors = v.collect(v.validatePassword(newPassword));
  if (errors.length) throw new HttpError(400, 'New password is not valid.', errors);

  const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  const matches = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
  if (!matches) throw new HttpError(400, 'Current password is incorrect.');

  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, req.user.id]);
  res.json({ message: 'Password updated.' });
}

module.exports = { changePassword };
