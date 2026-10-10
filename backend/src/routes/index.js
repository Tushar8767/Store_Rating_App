const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, authorize } = require('../middleware/auth');
const auth = require('../controllers/authController');
const users = require('../controllers/userController');
const stores = require('../controllers/storeController');
const ratings = require('../controllers/ratingController');
const admin = require('../controllers/adminController');
const owner = require('../controllers/ownerController');

const router = express.Router();
const h = asyncHandler;

// health check & monitoring
const os = require('os');
const pool = require('../config/db');

router.get('/health', async (req, res) => {
  let dbStatus = 'healthy';
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    dbStatus = 'unhealthy';
  }

  const isHealthy = dbStatus === 'healthy';
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'UP' : 'DOWN',
    timestamp: new Date().toISOString(),
    instanceId: process.env.INSTANCE_ID || os.hostname(),
    port: process.env.PORT || 5000,
    database: dbStatus,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

router.get('/metrics', async (req, res) => {
  const mem = process.memoryUsage();
  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  res.send(
`# HELP app_uptime_seconds Process uptime in seconds
# TYPE app_uptime_seconds gauge
app_uptime_seconds ${process.uptime()}

# HELP app_memory_rss_bytes Process resident set size
# TYPE app_memory_rss_bytes gauge
app_memory_rss_bytes ${mem.rss}

# HELP app_memory_heap_used_bytes Process heap memory used
# TYPE app_memory_heap_used_bytes gauge
app_memory_heap_used_bytes ${mem.heapUsed}
`
  );
});

// public
router.post('/auth/register', h(auth.register));
router.post('/auth/login', h(auth.login));

// every route below needs a valid JWT
router.use(authenticate);

// any logged-in role
router.put('/users/password', h(users.changePassword));

// normal users: browse and rate stores
router.get('/stores', authorize('user'), h(stores.listStores));
router.get('/stores/:id', authorize('user'), h(stores.getStore));
router.post('/stores/:id/rating', authorize('user'), h(ratings.createRating));
router.put('/stores/:id/rating', authorize('user'), h(ratings.updateRating));

// admin only
router.use('/admin', authorize('admin'));
router.get('/admin/dashboard', h(admin.dashboard));
router.get('/admin/users', h(admin.listUsers));
router.post('/admin/users', h(admin.createUser));
router.get('/admin/users/:id', h(admin.getUser));
router.get('/admin/stores', h(admin.listStores));
router.post('/admin/stores', h(admin.createStore));
router.get('/admin/owners', h(admin.listFreeOwners));

// store owner only
router.get('/owner/dashboard', authorize('owner'), h(owner.dashboard));

module.exports = router;
