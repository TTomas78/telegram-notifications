# telegram-notifications

API REST que recibe notificaciones de tus sistemas y las reenvía a un canal de Telegram. Protegida con API keys, con plantilla de mensaje consistente.

## Setup

1. **Crear el bot:** habla con [@BotFather](https://t.me/BotFather), crea un bot y copia el token.
2. **Obtener el chat_id:** agrega el bot al canal como administrador, envía un mensaje al canal y revisa `https://api.telegram.org/bot<TOKEN>/getUpdates` para ver el `chat.id` (los canales empiezan con `-100`).
3. **Configurar:**

   ```bash
   cp .env.example .env
   # editar .env con TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID y API_KEYS
   ```

4. **Arrancar:**

   ```bash
   npm install
   npm start        # o npm run dev para --watch
   ```

## Variables de entorno

| Variable             | Descripción                                   |
| -------------------- | --------------------------------------------- |
| `PORT`               | Puerto (default `3000`)                       |
| `TELEGRAM_BOT_TOKEN` | Token del bot (requerido)                     |
| `TELEGRAM_CHAT_ID`   | Chat/canal destino fijo (requerido)           |
| `API_KEYS`           | Keys válidas, separadas por comas (requerido) |
| `RATE_LIMIT_MAX`     | Requests por minuto por IP (default `60`)     |

## Uso

```bash
curl -X POST http://localhost:3000/api/v1/notifications \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-key-1" \
  -d '{
    "title": "Backup completado",
    "service": "billing-worker",
    "severity": "info",
    "detail": "12.4 GB en 3m 12s"
  }'
```

Respuesta: `201 { "id": 123, "status": "sent" }`

### Campos

- `title` (requerido, máx 200): título de la notificación
- `service` (requerido, máx 100): nombre del sistema que reporta
- `severity` (requerido): `info` ℹ️ · `warning` ⚠️ · `critical` 🔴
- `detail` (opcional, máx 3500): texto adicional

### Otros endpoints

- `GET /health` → `{ "status": "ok" }` (sin auth)

### Errores

Formato `{ "error": { "code", "message" } }`: `400` body inválido · `401` sin key · `403` key inválida · `429` rate limit · `502` Telegram falló.

## Tests

```bash
npm test
```

La API de Telegram está mockeada con nock; los tests no requieren credenciales reales.
