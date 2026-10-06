const pool = require('../config/db');
const HttpError = require('../utils/HttpError');

// GET /api/owner/dashboard - only ever looks at the store owned by the logged-in user
async function dashboard(req, res) {
  const storeResult = await pool.query(
    `SELECT s.id, s.name, s.address,
            ROUND(AVG(r.rating), 1)::float AS average_rating,
            COUNT(r.id)::int AS rating_count
     FROM stores s LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.owner_id = $1 GROUP BY s.id`,
    [req.user.id]
  );
  if (storeResult.rows.length === 0) {
    throw new HttpError(404, 'No store is assigned to your account yet.');
  }
  const store = storeResult.rows[0];

  const raters = await pool.query(
    `SELECT u.id, u.name, u.email, r.rating, r.updated_at
     FROM ratings r JOIN users u ON u.id = r.user_id
     WHERE r.store_id = $1
     ORDER BY r.updated_at DESC`,
    [store.id]
  );
  res.json({ store, raters: raters.rows });
}

module.exports = { dashboard };
