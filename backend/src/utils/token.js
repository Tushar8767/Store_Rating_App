const jwt = require('jsonwebtoken');

function signToken(user) {
  // Only id and role go into the token. Everything else is read from the database.
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
}

module.exports = { signToken };
