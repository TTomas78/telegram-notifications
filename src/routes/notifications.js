const express = require('express');
const { formatNotification } = require('../lib/formatter');
const { sendMessage, TelegramError } = require('../services/telegram');
const { validateNotification } = require('../middleware/validate');

function createNotificationsRouter(config) {
  const router = express.Router();

  router.post('/', validateNotification, async (req, res, next) => {
    try {
      const text = formatNotification(req.body);
      const id = await sendMessage({
        token: config.telegramBotToken,
        chatId: config.telegramChatId,
        text,
      });
      res.status(201).json({ id, status: 'sent' });
    } catch (err) {
      if (err instanceof TelegramError) {
        return res.status(502).json({
          error: { code: 'TELEGRAM_ERROR', message: 'Failed to deliver the notification to Telegram' },
        });
      }
      next(err);
    }
  });

  return router;
}

module.exports = { createNotificationsRouter };
