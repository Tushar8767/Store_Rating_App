const pool = require('../config/db');
const HttpError = require('../utils/HttpError');
const { validateRating } = require('../utils/validators');
const parseId = require('../utils/parseId');

async function checkInput(req) {
  const storeId = parseId(req.params.id);
  const rating = req.body.rating;

  const error = validateRating(rating);
  if (error) throw new HttpError(400, error);

  const store = storeId
    ? await pool.query('SELECT id FROM stores WHERE id = $1', [storeId])
    : { rows: [] };
  if (store.rows.length === 0) throw new HttpError(404, 'Store not found.');

  return { storeId, rating };
}

// POST /api/stores/:id/rating - first rating from this user for this store
async function createRating(req, res) {
  const { storeId, rating } = await checkInput(req);
  try {
    await pool.query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [
      req.user.id,
      storeId,
      rating,
    ]);
  } catch (err) {
    // UNIQUE (user_id, store_id) in the database is what really blocks duplicates.
    if (err.code === '23505') {
      throw new HttpError(409, 'You have already rated this store. Update your rating instead.');
    }
    throw err;
  }
  res.status(201).json({ message: 'Rating submitted.', rating });
}

// PUT /api/stores/:id/rating - change the existing rating
async function updateRating(req, res) {
  const { storeId, rating } = await checkInput(req);
  const result = await pool.query(
    'UPDATE ratings SET rating = $1, updated_at = NOW() WHERE user_id = $2 AND store_id = $3',
    [rating, req.user.id, storeId]
  );
  if (result.rowCount === 0) throw new HttpError(404, 'You have not rated this store yet.');
  res.json({ message: 'Rating updated.', rating });
}

module.exports = { createRating, updateRating };
