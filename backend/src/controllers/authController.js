const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const HttpError = require('../utils/HttpError');
const { signToken } = require('../utils/token');
const v = require('../utils/validators');

// Public sign-up. Role is always 'user' here; the client cannot choose it.
async function register(req, res) {
  const { name, email, address, password } = req.body;
  const errors = v.collect(
    v.validateName(name),
    v.validateEmail(email),
    v.validateAddress(address),
    v.validatePassword(password)
  );
  if (errors.length) throw new HttpError(400, 'Please fix the highlighted fields.', errors);

  const exists = await pool.query('SELECT 1 FROM users WHERE email = $1', [email.trim().toLowerCase()]);
  if (exists.rows.length) throw new HttpError(409, 'Email is already registered.');

  const hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, 'user') RETURNING id, name, email, address, role`,
    [name.trim(), email.trim().toLowerCase(), hash, address.trim()]
  );
  const user = result.rows[0];
  res.status(201).json({ token: signToken(user), user });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new HttpError(400, 'Email and password are required.');
  }

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
  const row = result.rows[0];
  // Same message for unknown email and wrong password so attackers learn nothing.
  if (!row || !(await bcrypt.compare(password, row.password_hash))) {
    throw new HttpError(401, 'Invalid email or password.');
  }

  const user = { id: row.id, name: row.name, email: row.email, address: row.address, role: row.role };
  res.json({ token: signToken(user), user });
}

module.exports = { register, login };
