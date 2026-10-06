const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const HttpError = require('../utils/HttpError');

// 1. Checks the JWT, then loads the user from the database so a deleted user
//    or a changed role cannot keep using an old token.
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Please log in to continue.');

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new HttpError(401, 'Your session has expired. Please log in again.');
    }

    const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [payload.id]);
    if (result.rows.length === 0) throw new HttpError(401, 'Account no longer exists.');

    req.user = result.rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

// 2. Allows the request only if the user's role (read from the database) is in the list.
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, 'You do not have permission to do this.'));
    }
    next();
  };
}

module.exports = { authenticate, authorize };
