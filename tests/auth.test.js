const { createAuthMiddleware } = require('../src/middleware/auth');

function run(middleware, headers = {}) {
  const req = { get: (name) => headers[name.toLowerCase()] };
  const res = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
  let nextCalled = false;
  middleware(req, res, () => { nextCalled = true; });
  return { res, nextCalled };
}

const auth = createAuthMiddleware(['valid-key', 'other-key']);

describe('auth middleware', () => {
  test('returns 401 when x-api-key header is missing', () => {
    const { res, nextCalled } = run(auth);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: { code: 'MISSING_API_KEY', message: expect.any(String) } });
    expect(nextCalled).toBe(false);
  });

  test('returns 403 when the key is not recognized', () => {
    const { res, nextCalled } = run(auth, { 'x-api-key': 'wrong-key' });
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: { code: 'INVALID_API_KEY', message: expect.any(String) } });
    expect(nextCalled).toBe(false);
  });

  test('returns 403 for keys that share a prefix with a valid key', () => {
    const { res } = run(auth, { 'x-api-key': 'valid' });
    expect(res.statusCode).toBe(403);
  });

  test('calls next for every configured valid key', () => {
    expect(run(auth, { 'x-api-key': 'valid-key' }).nextCalled).toBe(true);
    expect(run(auth, { 'x-api-key': 'other-key' }).nextCalled).toBe(true);
  });
});
