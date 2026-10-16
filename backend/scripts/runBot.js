const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const bot = require('../services/telegramBot');
const logger = require('../utils/logger');

// Security check: Only start bot if explicitly enabled
if (process.env.BOT_ENABLED !== 'true') {
  logger.warn("⚠️ BOT_ENABLED='true' emas. Telegram bot ishga tushirilmaydi.");
  logger.info("Botni faollashtirish uchun backend/.env faylida BOT_ENABLED=true qiling.");
  process.exit(0);
}

if (!process.env.TELEGRAM_BOT_TOKEN) {
  logger.error("❌ TELEGRAM_BOT_TOKEN kiritilmagan. Bot ishga tushmadi.");
  process.exit(1);
}

logger.info(`DentUz Telegram Bot jarayoni ishga tushirilmoqda (PID: ${process.pid})...`);

try {
  bot.startPolling();
  logger.info("✅ Telegram Bot muvaffaqiyatli ishga tushdi va xabarlarni tinglamoqda (long-polling).");
} catch (err) {
  logger.error('Bot polling xatoligi:', err);
  process.exit(1);
}

// Graceful shutdown
const shutdown = () => {
  logger.info('\nBot to\'xtatilmoqda...');
  try {
    bot.stopPolling();
  } catch {}
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
