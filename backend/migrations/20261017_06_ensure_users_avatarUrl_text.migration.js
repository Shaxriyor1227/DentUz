/**
 * Migration: 20261017_06_ensure_users_avatarUrl_text
 * Ensures avatarUrl column in users table is of type TEXT for long URLs / base64 avatars.
 * Idempotent: safe to run multiple times.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const [cols] = await queryInterface.sequelize.query(`
        SELECT data_type FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'avatarUrl'
      `);

      if (cols && cols.length > 0) {
        if (cols[0].data_type !== 'text') {
          await queryInterface.sequelize.query(`
            ALTER TABLE users ALTER COLUMN "avatarUrl" TYPE TEXT;
          `);
        }
      } else {
        await queryInterface.sequelize.query(`
          ALTER TABLE users ADD COLUMN "avatarUrl" TEXT DEFAULT NULL;
        `);
      }
    } catch (err) {
      console.warn('Migration 20261017_06 warning (ignorable if table not yet created):', err.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Non-destructive down migration
  },
};
