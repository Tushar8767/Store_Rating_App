// Express 4 does not catch errors from async functions, so this forwards them to the error handler.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
