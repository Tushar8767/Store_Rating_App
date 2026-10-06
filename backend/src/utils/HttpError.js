// Small error type so controllers can say "this is a 404" and the error handler does the rest.
class HttpError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors; // optional list of field messages
  }
}

module.exports = HttpError;
