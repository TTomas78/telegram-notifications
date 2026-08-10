const nock = require('nock');
const { sendMessage, TelegramError } = require('../src/services/telegram');

const TOKEN = 'test-token';
const CHAT_ID = '-100123';
const API = 'https://api.telegram.org';
const PATH = `/bot${TOKEN}/sendMessage`;

beforeEach(() => nock.cleanAll());
afterAll(() => nock.restore());

describe('sendMessage', () => {
  test('posts HTML message to the Telegram Bot API and returns message id', async () => {
    const scope = nock(API)
      .post(PATH, { chat_id: CHAT_ID, text: '<b>hola</b>', parse_mode: 'HTML' })
      .reply(200, { ok: true, result: { message_id: 42 } });

    const id = await sendMessage({ token: TOKEN, chatId: CHAT_ID, text: '<b>hola</b>' });

    expect(id).toBe(42);
    expect(scope.isDone()).toBe(true);
  });

  test('throws TelegramError when the API responds with ok:false', async () => {
    nock(API).post(PATH).times(2).reply(400, { ok: false, description: 'Bad Request: chat not found' });

    await expect(
      sendMessage({ token: TOKEN, chatId: CHAT_ID, text: 'x' })
    ).rejects.toThrow(TelegramError);
    await expect(
      sendMessage({ token: TOKEN, chatId: CHAT_ID, text: 'x' })
    ).rejects.toThrow('chat not found');
  });

  test('throws TelegramError on network failure', async () => {
    nock(API).post(PATH).replyWithError('connection reset');

    await expect(
      sendMessage({ token: TOKEN, chatId: CHAT_ID, text: 'x' })
    ).rejects.toThrow(TelegramError);
  });
});
