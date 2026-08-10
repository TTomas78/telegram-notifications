class TelegramError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'TelegramError';
    this.cause = cause;
  }
}

async function sendMessage({ token, chatId, text }) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
  } catch (err) {
    throw new TelegramError(`Telegram request failed: ${err.message}`, err);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    throw new TelegramError(`Telegram API error: ${data.description || `HTTP ${response.status}`}`);
  }

  return data.result.message_id;
}

module.exports = { sendMessage, TelegramError };
