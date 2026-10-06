const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const HttpError = require('../utils/HttpError');
const { getSort, likePattern } = require('../utils/query');
const parseId = require('../utils/parseId');
const v = require('../utils/validators');

const ROLES = ['admin', 'user', 'owner'];

const USER_SORT = { name: 'u.name', email: 'u.email', address: 'u.address', role: 'u.role' };
const STORE_SORT = { name: 's.name', email: 's.email', address: 's.address', rating: 'rating' };

async function dashboard(req, res) {
  const result = await pool.query(`
    SELECT (SELECT COUNT(*) FROM users)::int   AS total_users,
           (SELECT COUNT(*) FROM stores)::int  AS total_stores,
           (SELECT COUNT(*) FROM ratings)::int AS total_ratings`);
  res.json(result.rows[0]);
}

// Adds one "column ILIKE $n" condition per filter that was sent.
function buildFilters(query, columns, params) {
  const where = [];
  for (const [field, column] of Object.entries(columns)) {
    if (query[field]) {
      params.push(likePattern(query[field]));
      where.push(`${column} ILIKE $${params.length}`);
    }
  }
  return where;
}

// GET /api/admin/users?name=&email=&address=&role=&sortBy=&order=
async function listUsers(req, res) {
  const params = [];
  const where = buildFilters(req.query, { name: 'u.name', email: 'u.email', address: 'u.address' }, params);
  if (req.query.role) {
    if (!ROLES.includes(req.query.role)) throw new HttpError(400, 'Role must be admin, user or owner.');
    params.push(req.query.role);
    where.push(`u.role = $${params.length}`);
  }

  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.address, u.role
     FROM users u
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY ${getSort(req.query, USER_SORT, 'name')}, u.id`,
    params
  );
  res.json(result.rows);
}

// GET /api/admin/users/:id - for a store owner this also returns the store's average rating
async function getUser(req, res) {
  const id = parseId(req.params.id);
  if (!id) throw new HttpError(404, 'User not found.');

  const result = await pool.query('SELECT id, name, email, address, role FROM users WHERE id = $1', [id]);
  if (result.rows.length === 0) throw new HttpError(404, 'User not found.');
  const user = result.rows[0];

  if (user.role === 'owner') {
    const store = await pool.query(
      `SELECT s.id, s.name, ROUND(AVG(r.rating), 1)::float AS rating, COUNT(r.id)::int AS rating_count
       FROM stores s LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = $1 GROUP BY s.id`,
      [id]
    );
    user.store = store.rows[0] || null;
  }
  res.json(user);
}

// POST /api/admin/users - admin can create user, admin or owner accounts
async function createUser(req, res) {
  const { name, email, address, password, role } = req.body;
  const errors = v.collect(
    v.validateName(name),
    v.validateEmail(email),
    v.validateAddress(address),
    v.validatePassword(password),
    ROLES.includes(role) ? undefined : 'Role must be admin, user or owner.'
  );
  if (errors.length) throw new HttpError(400, 'Please fix the highlighted fields.', errors);

  const hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role`,
    [name.trim(), email.trim().toLowerCase(), hash, address.trim(), role]
  );
  res.status(201).json(result.rows[0]);
}

// GET /api/admin/stores?name=&email=&address=&sortBy=&order=
async function listStores(req, res) {
  const params = [];
  const where = buildFilters(req.query, { name: 's.name', email: 's.email', address: 's.address' }, params);

  const result = await pool.query(
    `SELECT s.id, s.name, s.email, s.address,
            ROUND(AVG(r.rating), 1)::float AS rating
     FROM stores s LEFT JOIN ratings r ON r.store_id = s.id
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     GROUP BY s.id
     ORDER BY ${getSort(req.query, STORE_SORT, 'name')} NULLS LAST, s.id`,
    params
  );
  res.json(result.rows);
}

// GET /api/admin/owners - owners without a store yet, used by the Add Store form
async function listFreeOwners(req, res) {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email FROM users u
     WHERE u.role = 'owner' AND NOT EXISTS (SELECT 1 FROM stores s WHERE s.owner_id = u.id)
     ORDER BY u.name`
  );
  res.json(result.rows);
}

// POST /api/admin/stores
async function createStore(req, res) {
  const { name, email, address, ownerId } = req.body;
  const errors = v.collect(
    typeof name === 'string' && name.trim().length >= 1 && name.trim().length <= 100
      ? undefined
      : 'Store name must be between 1 and 100 characters.',
    v.validateEmail(email),
    v.validateAddress(address)
  );
  if (errors.length) throw new HttpError(400, 'Please fix the highlighted fields.', errors);

  let owner = null;
  if (ownerId !== undefined && ownerId !== null && ownerId !== '') {
    owner = parseId(ownerId);
    const check = owner ? await pool.query('SELECT role FROM users WHERE id = $1', [owner]) : { rows: [] };
    if (check.rows.length === 0) throw new HttpError(404, 'Owner not found.');
    if (check.rows[0].role !== 'owner') throw new HttpError(400, 'Selected user is not a store owner.');
  }

  try {
    const result = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, address, owner_id`,
      [name.trim(), email.trim().toLowerCase(), address.trim(), owner]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      const msg = err.constraint && err.constraint.includes('owner')
        ? 'This owner already has a store.'
        : 'A store with this email already exists.';
      throw new HttpError(409, msg);
    }
    throw err;
  }
}

module.exports = { dashboard, listUsers, getUser, createUser, listStores, listFreeOwners, createStore };
