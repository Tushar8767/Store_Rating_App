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
