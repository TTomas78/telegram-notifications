require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function loadConfig() {
  return {
    port: parseInt(process.env.PORT || '3000', 10),
    telegramBotToken: required('TELEGRAM_BOT_TOKEN'),
    telegramChatId: required('TELEGRAM_CHAT_ID'),
    apiKeys: required('API_KEYS').split(',').map((k) => k.trim()).filter(Boolean),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '60', 10),
  };
}

module.exports = { loadConfig };
