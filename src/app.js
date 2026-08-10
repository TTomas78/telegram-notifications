const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { loadConfig } = require('./config');
const { createAuthMiddleware } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const healthRouter = require('./routes/health');
const { createNotificationsRouter } = require('./routes/notifications');

function createApp(config = loadConfig()) {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: '16kb' }));

  app.use('/health', healthRouter);

  app.use(
    '/api/v1/notifications',
    rateLimit({ windowMs: 60 * 1000, max: config.rateLimitMax, standardHeaders: true, legacyHeaders: false }),
    createAuthMiddleware(config.apiKeys),
    createNotificationsRouter(config)
  );

  app.use((req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
