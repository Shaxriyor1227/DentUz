const path = require('path');
const { Umzug, SequelizeStorage } = require('umzug');
const sequelize = require('./database');

const umzug = new Umzug({
  migrations: {
    glob: path.join(__dirname, '../migrations/*.migration.js').replace(/\\/g, '/'),
    resolve: ({ name, path: filePath, context }) => {
      const migration = require(filePath);
      return {
        name,
        up: async () => migration.up(context, sequelize.constructor),
        down: async () => migration.down(context, sequelize.constructor),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize, tableName: 'SequelizeMeta' }),
  logger: console,
});

/**
 * Asserts that all database migrations are applied before application starts.
 * Protects production against running code on an outdated database schema.
 */
async function assertNoPendingMigrations() {
  try {
    const pending = await umzug.pending();
    if (pending.length > 0) {
      const pendingNames = pending.map((m) => m.name).join(', ');
      throw new Error(
        `🚨 XATOLIK: Bazada kutilayotgan migratsiyalar mavjud [${pendingNames}]. ` +
        `Iltimos, serverni ishga tushirishdan oldin 'npm run migrate' buyrug'ini bajaring!`
      );
    }
  } catch (err) {
    if (err.message.includes('🚨 XATOLIK: Bazada kutilayotgan')) {
      throw err;
    }
    // If SequelizeMeta doesn't exist yet on fresh DB
    console.warn('Migratsiya holatini tekshirishda ogohlantirish:', err.message);
  }
}

if (require.main === module) {
  const command = process.argv[2] || 'up';

  (async () => {
    try {
      await sequelize.authenticate();
      if (command === 'up') {
        console.log('🔄 Barcha migratsiyalar bajarilmoqda (migrating up)...');
        const executed = await umzug.up();
        console.log(`✅ Migratsiya muvaffaqiyatli yakunlandi. Bajarilgan: ${executed.length} ta.`);
      } else if (command === 'down' || command === 'undo') {
        console.log('↩️ Oxirgi migratsiya orqaga qaytarilmoqda (migrating down)...');
        const executed = await umzug.down();
        console.log(`✅ Oxirgi migratsiya bekor qilindi. Qaytarilgan: ${executed.length} ta.`);
      } else if (command === 'status') {
        const pending = await umzug.pending();
        const executed = await umzug.executed();
        console.log(`Bajarilgan migratsiyalar: ${executed.length}, Kutilayotgan: ${pending.length}`);
      }
      process.exit(0);
    } catch (err) {
      console.error('❌ Migratsiya xatoligi:', err);
      process.exit(1);
    }
  })();
}

module.exports = umzug;
module.exports.assertNoPendingMigrations = assertNoPendingMigrations;
