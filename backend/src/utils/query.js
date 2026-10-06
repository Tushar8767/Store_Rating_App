// Sort values come from the URL, so they are matched against a fixed list.
// User input is never pasted into the SQL text.
function getSort(query, allowed, defaultKey) {
  const key = Object.prototype.hasOwnProperty.call(allowed, query.sortBy) ? query.sortBy : defaultKey;
  const column = allowed[key];
  const direction = String(query.order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return `${column} ${direction}`;
}

// Turns "pune" into "%pune%" for ILIKE. Escapes % and _ typed by the user.
function likePattern(value) {
  return `%${String(value).replace(/[\\%_]/g, '\\$&')}%`;
}

module.exports = { getSort, likePattern };
