const { validateNotification } = require('../src/middleware/validate');

function run(body) {
  const req = { body };
  const res = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
  let nextCalled = false;
  validateNotification(req, res, () => { nextCalled = true; });
  return { res, nextCalled };
}

const valid = { title: 'Backup completado', service: 'billing-worker', severity: 'info' };

describe('validateNotification', () => {
  test('accepts a valid body and calls next', () => {
    const { nextCalled } = run(valid);
    expect(nextCalled).toBe(true);
  });

  test('accepts optional detail', () => {
    expect(run({ ...valid, detail: 'todo bien' }).nextCalled).toBe(true);
  });

  test.each(['title', 'service', 'severity'])('returns 400 when %s is missing', (field) => {
    const body = { ...valid };
    delete body[field];
    const { res, nextCalled } = run(body);
    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toContain(field);
    expect(nextCalled).toBe(false);
  });

  test('returns 400 when severity is not allowed', () => {
    const { res } = run({ ...valid, severity: 'urgent' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toContain('severity');
  });

  test('returns 400 when fields are not strings', () => {
    expect(run({ ...valid, title: 123 }).res.statusCode).toBe(400);
    expect(run({ ...valid, detail: ['x'] }).res.statusCode).toBe(400);
  });

  test('returns 400 when title or service are empty', () => {
    expect(run({ ...valid, title: '' }).res.statusCode).toBe(400);
    expect(run({ ...valid, service: '   ' }).res.statusCode).toBe(400);
  });

  test('returns 400 when fields exceed max length', () => {
    expect(run({ ...valid, title: 'x'.repeat(201) }).res.statusCode).toBe(400);
    expect(run({ ...valid, service: 'x'.repeat(101) }).res.statusCode).toBe(400);
    expect(run({ ...valid, detail: 'x'.repeat(3501) }).res.statusCode).toBe(400);
  });

  test('returns 400 when body is missing entirely', () => {
    const { res } = run(undefined);
    expect(res.statusCode).toBe(400);
  });
});
