require('dotenv').config();
const bot = require('../services/telegramBot');

console.log('DentUz Telegram Bot mustaqil xizmat sifatida ishga tushirilmoqda...');
bot.startPolling();

// Graceful shutdown
const shutdown = () => {
  console.log('\nBot to‘xtatilmoqda...');
  bot.stopPolling();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
