process.env.TELEGRAM_BOT_TOKEN = 'test-token';
process.env.TELEGRAM_CHAT_ID = '-100123';
process.env.API_KEYS = 'test-key';
process.env.RATE_LIMIT_MAX = '1000';

const request = require('supertest');
const nock = require('nock');
const { createApp } = require('../src/app');

const app = createApp();
const API = 'https://api.telegram.org';
const PATH = '/bottest-token/sendMessage';
const VALID_BODY = { title: 'Backup completado', service: 'billing-worker', severity: 'info' };

function mockTelegram(status = 200, payload = { ok: true, result: { message_id: 42 } }) {
  return nock(API).post(PATH).reply(status, payload);
}

beforeEach(() => nock.cleanAll());
afterAll(() => nock.restore());

describe('GET /health', () => {
  test('returns 200 without authentication', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('POST /api/v1/notifications', () => {
  test('returns 401 without API key', async () => {
    const res = await request(app).post('/api/v1/notifications').send(VALID_BODY);
    expect(res.status).toBe(401);
  });

  test('returns 403 with a wrong API key', async () => {
    const res = await request(app)
      .post('/api/v1/notifications')
      .set('x-api-key', 'nope')
      .send(VALID_BODY);
    expect(res.status).toBe(403);
  });

  test('returns 400 for an invalid body', async () => {
    const res = await request(app)
      .post('/api/v1/notifications')
      .set('x-api-key', 'test-key')
      .send({ title: 'sin service ni severity' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('sends the formatted notification and returns 201 with the message id', async () => {
    let sent;
    nock(API)
      .post(PATH, (body) => { sent = body; return true; })
      .reply(200, { ok: true, result: { message_id: 42 } });

    const res = await request(app)
      .post('/api/v1/notifications')
      .set('x-api-key', 'test-key')
      .send({ ...VALID_BODY, severity: 'critical', detail: 'disco lleno' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 42, status: 'sent' });

    expect(sent.chat_id).toBe('-100123');
    expect(sent.parse_mode).toBe('HTML');
    expect(sent.text).toContain('🔴 <b>Backup completado</b>');
    expect(sent.text).toContain('<b>Servicio:</b> billing-worker');
    expect(sent.text).toContain('disco lleno');
  });

  test('returns 502 when Telegram fails', async () => {
    mockTelegram(400, { ok: false, description: 'Bad Request: chat not found' });

    const res = await request(app)
      .post('/api/v1/notifications')
      .set('x-api-key', 'test-key')
      .send(VALID_BODY);

    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe('TELEGRAM_ERROR');
  });

  test('unknown routes return a JSON 404', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
