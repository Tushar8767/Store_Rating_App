// Returns a positive integer that fits a PostgreSQL INTEGER column, or null.
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id >= 1 && id <= 2147483647 ? id : null;
}

module.exports = parseId;
