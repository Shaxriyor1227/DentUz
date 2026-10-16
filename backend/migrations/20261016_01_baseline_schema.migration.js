const { DataTypes } = require('sequelize');

/**
 * Baseline Migration: Ensures baseline multi-tenant structure and indexes exist.
 * Idempotent with IF NOT EXISTS checks.
 */
module.exports = {
  up: async (queryInterface) => {
    // 1. Roles expansion
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type typ
          JOIN pg_enum enm ON typ.oid = enm.enumtypid
          WHERE typ.typname = 'enum_users_role' AND enm.enumlabel = 'administrator'
        ) THEN
          ALTER TYPE "enum_users_role" ADD VALUE 'administrator';
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_type typ
          JOIN pg_enum enm ON typ.oid = enm.enumtypid
          WHERE typ.typname = 'enum_users_role' AND enm.enumlabel = 'accountant'
        ) THEN
          ALTER TYPE "enum_users_role" ADD VALUE 'accountant';
        END IF;
      END $$;
    `).catch(() => {});

    // 2. Multi-tenant indexes
    const tables = [
      'users', 'patients', 'appointments', 'invoices',
      'payments', 'inventory', 'services', 'medical_records',
      'treatment_plans', 'lab_orders', 'notifications'
    ];

    for (const table of tables) {
      await queryInterface.sequelize.query(`
        CREATE INDEX IF NOT EXISTS "idx_${table}_clinic_id" ON "${table}" ("clinicId");
      `).catch(() => {});
    }
  },

  down: async (queryInterface) => {
    const tables = [
      'users', 'patients', 'appointments', 'invoices',
      'payments', 'inventory', 'services', 'medical_records',
      'treatment_plans', 'lab_orders', 'notifications'
    ];

    for (const table of tables) {
      await queryInterface.sequelize.query(`
        DROP INDEX IF EXISTS "idx_${table}_clinic_id";
      `).catch(() => {});
    }
  },
};
