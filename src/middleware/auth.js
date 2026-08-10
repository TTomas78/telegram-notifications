const crypto = require('crypto');

function keyEquals(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

function createAuthMiddleware(apiKeys) {
  return function auth(req, res, next) {
    const key = req.get('x-api-key');

    if (!key) {
      return res.status(401).json({
        error: { code: 'MISSING_API_KEY', message: 'Header x-api-key is required' },
      });
    }

    if (!apiKeys.some((valid) => keyEquals(valid, key))) {
      return res.status(403).json({
        error: { code: 'INVALID_API_KEY', message: 'The provided API key is not valid' },
      });
    }

    next();
  };
}

module.exports = { createAuthMiddleware };
