const pool = require('../config/db');
const HttpError = require('../utils/HttpError');
const { getSort, likePattern } = require('../utils/query');
const parseId = require('../utils/parseId');

const SORT_COLUMNS = {
  name: 's.name',
  address: 's.address',
  rating: 'overall_rating',
};

// Shared SELECT: average rating of every user for the store, plus the logged-in user's own rating.
const STORE_SELECT = `
  SELECT s.id, s.name, s.address,
         ROUND(AVG(r.rating), 1)::float AS overall_rating,
         COUNT(r.id)::int AS rating_count,
         (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = $1) AS my_rating
  FROM stores s
  LEFT JOIN ratings r ON r.store_id = s.id`;

// GET /api/stores?name=&address=&sortBy=&order=
async function listStores(req, res) {
  const params = [req.user.id];
  const where = [];
  if (req.query.name) {
    params.push(likePattern(req.query.name));
    where.push(`s.name ILIKE $${params.length}`);
  }
  if (req.query.address) {
    params.push(likePattern(req.query.address));
    where.push(`s.address ILIKE $${params.length}`);
  }

  const sql = `${STORE_SELECT}
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    GROUP BY s.id
    ORDER BY ${getSort(req.query, SORT_COLUMNS, 'name')} NULLS LAST, s.id`;
  const result = await pool.query(sql, params);
  res.json(result.rows);
}

async function getStore(req, res) {
  const id = parseId(req.params.id);
  if (!id) throw new HttpError(404, 'Store not found.');
  const result = await pool.query(`${STORE_SELECT} WHERE s.id = $2 GROUP BY s.id`, [req.user.id, id]);
  if (result.rows.length === 0) throw new HttpError(404, 'Store not found.');
  res.json(result.rows[0]);
}

module.exports = { listStores, getStore };
