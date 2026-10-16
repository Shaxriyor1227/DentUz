const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const bot = require('../services/telegramBot');
const logger = require('../utils/logger');

const LOCK_FILE = path.join(__dirname, '../.bot.lock');

// Prevent duplicate bot instances (avoid Telegram 409 Conflict error on Render/local)
if (fs.existsSync(LOCK_FILE)) {
  try {
    const existingPid = parseInt(fs.readFileSync(LOCK_FILE, 'utf8'), 10);
    // Check if process with PID is actually running
    process.kill(existingPid, 0);
    logger.error(`Bot allaqachon ishlamoqda (PID: ${existingPid}). Bitta tokenda ikki bot ishlay olmaydi.`);
    process.exit(1);
  } catch (err) {
    // Process is dead, stale lock file
    try { fs.unlinkSync(LOCK_FILE); } catch {}
  }
}

try {
  fs.writeFileSync(LOCK_FILE, String(process.pid));
} catch (e) {
  logger.warn('Lock fayl yaratilmadi:', e.message);
}

logger.info(`DentUz Telegram Bot mustaqil xizmat sifatida ishga tushirilmoqda (PID: ${process.pid})...`);
try {
  bot.startPolling();
} catch (err) {
  logger.error('Bot polling xatoligi:', err);
}

// Graceful shutdown
const shutdown = () => {
  logger.info('\nBot to\'xtatilmoqda...');
  try {
    bot.stopPolling();
  } catch {}
  try {
    if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE);
  } catch {}
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', () => {
  try {
    if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE);
  } catch {}
});
