function notFound(req, res) {
  res.status(404).json({ message: 'Route not found.' });
}

// Every error ends up here, so the response format is always { message, errors? }.
function errorHandler(err, req, res, next) {
  if (err.status) {
    return res.status(err.status).json({ message: err.message, errors: err.errors });
  }
  // PostgreSQL unique violation (duplicate email or duplicate rating)
  if (err.code === '23505') {
    return res.status(409).json({ message: 'This record already exists.' });
  }
  // Foreign key violation (for example an owner id that does not exist)
  if (err.code === '23503') {
    return res.status(400).json({ message: 'A referenced record does not exist.' });
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
}

module.exports = { notFound, errorHandler };
