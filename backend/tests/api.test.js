// tests/api.test.js – 6 lightweight tests; no MongoDB server needed
// We import app.js directly (no DB connect, no listen) using supertest
const request = require('supertest');
const app = require('../src/app');

// Silence mongoose connection errors during tests (no DB available)
beforeAll(() => {
  process.env.JWT_SECRET = 'testsecretkey1234567890';
  process.env.NODE_ENV = 'test';
});

describe('Health check', () => {
  test('GET /api/health returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Auth – validation', () => {
  test('Register with invalid email returns 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test',
      email: 'not-an-email',
      password: 'Abcdefgh1',
      role: 'donor',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('Register with short password returns 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test',
      email: 'test@example.com',
      password: 'short',
      role: 'donor',
    });
    expect(res.statusCode).toBe(400);
  });

  test('Register with invalid role returns 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test',
      email: 'test@example.com',
      password: 'LongPassword1',
      role: 'admin', // admin not allowed via register
    });
    expect(res.statusCode).toBe(400);
  });

  test('Login with empty body returns 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
  });
});

describe('Protected routes – no token', () => {
  test('GET /api/auth/me without token returns 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/admin/stats without token returns 401', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.statusCode).toBe(401);
  });
});
