const { DataTypes } = require('sequelize');

/**
 * Migration: 20261016_02_audit_logs_and_soft_delete
 * 1. Creates audit_logs table for HIPAA/GDPR compliance
 * 2. Adds deletedAt to patients, payments, invoices for paranoid soft-deletes
 * Completely idempotent and reversible (down).
 */
module.exports = {
  up: async (queryInterface) => {
    // 1. Create audit_logs table if not exists
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "clinicId" UUID REFERENCES "clinics" ("id") ON DELETE SET NULL,
        "userId" UUID,
        "userEmail" VARCHAR(255),
        "userRole" VARCHAR(255),
        "action" VARCHAR(32) NOT NULL,
        "resource" VARCHAR(64) NOT NULL,
        "resourceId" VARCHAR(255),
        "ip" VARCHAR(255),
        "userAgent" TEXT,
        "metadata" JSONB DEFAULT '{}'::jsonb,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `).catch(() => {});

    // Create audit log indexes
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_clinic_id" ON "audit_logs" ("clinicId");
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_id" ON "audit_logs" ("userId");
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_resource" ON "audit_logs" ("resource", "resourceId");
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_created_at" ON "audit_logs" ("createdAt");
    `).catch(() => {});

    // 2. Add deletedAt for soft delete (paranoid)
    const softDeleteTables = ['patients', 'payments', 'invoices'];
    for (const table of softDeleteTables) {
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '${table}') THEN
            ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMPTZ;
          END IF;
        END $$;
      `).catch(() => {});
    }
  },

  down: async (queryInterface) => {
    // Rollback: drop audit_logs and soft delete columns
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS "audit_logs" CASCADE;
    `).catch(() => {});

    const softDeleteTables = ['patients', 'payments', 'invoices'];
    for (const table of softDeleteTables) {
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '${table}') THEN
            ALTER TABLE "${table}" DROP COLUMN IF EXISTS "deletedAt";
          END IF;
        END $$;
      `).catch(() => {});
    }
  },
};
