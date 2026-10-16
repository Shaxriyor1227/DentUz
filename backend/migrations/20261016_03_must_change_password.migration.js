/**
 * Migration: 20261016_03_must_change_password
 * Adds `mustChangePassword` flag to `users` table for temporary password resets.
 * Idempotent and reversible.
 */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'mustChangePassword') THEN
            ALTER TABLE "users" ADD COLUMN "mustChangePassword" BOOLEAN DEFAULT false;
          END IF;
        END IF;
      END $$;
    `).catch(() => {});
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'mustChangePassword') THEN
            ALTER TABLE "users" DROP COLUMN "mustChangePassword";
          END IF;
        END IF;
      END $$;
    `).catch(() => {});
  },
};
