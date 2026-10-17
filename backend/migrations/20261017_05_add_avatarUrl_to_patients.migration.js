/**
 * Migration: 20261017_05_add_avatarUrl_to_patients
 * Adds avatarUrl column to patients table.
 * Idempotent: safe to run multiple times.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'patients' AND column_name = 'avatarUrl'
        ) THEN
          ALTER TABLE patients ADD COLUMN "avatarUrl" VARCHAR(255) DEFAULT NULL;
        END IF;
      END $$;
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE patients DROP COLUMN IF EXISTS "avatarUrl";
    `);
  },
};
