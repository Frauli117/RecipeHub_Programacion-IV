const request = require('supertest');
const app = require('../src/app');

describe('API base sin MongoDB', () => {
  test('GET /api/health responde ok', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.timestamp).toBe('string');
  });

  test('POST /api/recetas sin token responde 401', async () => {
    const res = await request(app).post('/api/recetas').send({});

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('Ruta inexistente responde 404', async () => {
    const res = await request(app).get('/api/no-existe');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
