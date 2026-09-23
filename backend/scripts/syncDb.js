
// One-time script to drop & recreate all tables (dev only)
require('dotenv').config();
const db = require('../models');

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ DB ulanish muvaffaqiyatli');
    await db.sequelize.sync({ force: true });
    console.log('✅ Barcha jadvallar yaratildi (force sync)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Sync xatosi:', err);
    process.exit(1);
  }
})();
