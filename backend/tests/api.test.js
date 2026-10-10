const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

test('Backend Health & Monitoring Tests', async (t) => {
  await t.test('GET /api/health returns 200 and instance metadata', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'UP');
    assert.ok(res.body.instanceId);
    assert.ok(res.body.timestamp);
    assert.strictEqual(res.body.database, 'healthy');
  });

  await t.test('GET /api/metrics returns Prometheus gauge format metrics', async () => {
    const res = await request(app).get('/api/metrics');
    assert.strictEqual(res.status, 200);
    assert.match(res.text, /app_uptime_seconds/);
    assert.match(res.text, /app_memory_rss_bytes/);
  });
});

test('Authentication & Validation Tests', async (t) => {
  await t.test('POST /api/auth/login with invalid credentials returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'WrongPassword@123' });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.message, 'Invalid email or password.');
  });

  await t.test('POST /api/auth/register rejects short names (<20 chars)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Short Name',
        email: 'test.short@example.com',
        address: '123 Test Street, City',
        password: 'ValidPassword@123',
      });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.errors.some((e) => e.includes('between 20 and 60 characters')));
  });

  await t.test('POST /api/auth/register rejects passwords without special characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Valid Name For Testing Here',
        email: 'test.nospecial@example.com',
        address: '123 Test Street, City',
        password: 'Password123',
      });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.errors.some((e) => e.includes('special character')));
  });
});

test('Role-Based Authorization & Store Flow Tests', async (t) => {
  let userToken;
  let adminToken;

  await t.test('Log in as demo Normal User', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rahul.sharma@example.com', password: 'Rahul@123' });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.role, 'user');
    userToken = res.body.token;
  });

  await t.test('Log in as demo System Administrator', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@storerating.com', password: 'Admin@123' });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.role, 'admin');
    adminToken = res.body.token;
  });

  await t.test('Normal User can retrieve store list', async () => {
    const res = await request(app)
      .get('/api/stores')
      .set('Authorization', `Bearer ${userToken}`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length > 0);
  });

  await t.test('Normal User is forbidden from accessing Admin Dashboard (403)', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${userToken}`);
    assert.strictEqual(res.status, 403);
  });

  await t.test('Admin User can access Admin Dashboard', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.strictEqual(res.status, 200);
    assert.ok(typeof res.body.total_users === 'number');
    assert.ok(typeof res.body.total_stores === 'number');
    assert.ok(typeof res.body.total_ratings === 'number');
  });

  await t.test('Rating validation rejects scores outside 1-5', async () => {
    const res = await request(app)
      .post('/api/stores/1/rating')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 10 });
    assert.strictEqual(res.status, 400);
    assert.match(res.body.message, /whole number from 1 to 5/);
  });
});
