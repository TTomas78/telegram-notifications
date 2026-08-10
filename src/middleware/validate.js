const SEVERITIES = ['info', 'warning', 'critical'];

const LIMITS = {
  title: 200,
  service: 100,
  detail: 3500,
};

function invalid(res, message) {
  return res.status(400).json({
    error: { code: 'VALIDATION_ERROR', message },
  });
}

function validateNotification(req, res, next) {
  const body = req.body;

  if (!body || typeof body !== 'object') {
    return invalid(res, 'Request body must be a JSON object');
  }

  for (const field of ['title', 'service']) {
    const value = body[field];
    if (typeof value !== 'string' || value.trim().length === 0) {
      return invalid(res, `Field "${field}" is required and must be a non-empty string`);
    }
    if (value.length > LIMITS[field]) {
      return invalid(res, `Field "${field}" must be at most ${LIMITS[field]} characters`);
    }
  }

  if (!SEVERITIES.includes(body.severity)) {
    return invalid(res, `Field "severity" must be one of: ${SEVERITIES.join(', ')}`);
  }

  if (body.detail !== undefined) {
    if (typeof body.detail !== 'string') {
      return invalid(res, 'Field "detail" must be a string');
    }
    if (body.detail.length > LIMITS.detail) {
      return invalid(res, `Field "detail" must be at most ${LIMITS.detail} characters`);
    }
  }

  next();
}

module.exports = { validateNotification };
