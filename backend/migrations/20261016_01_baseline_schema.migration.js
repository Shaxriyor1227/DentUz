const { DataTypes } = require('sequelize');

/**
 * Baseline Migration: 20261016_01_baseline_schema
 * Ensures base multi-tenant tables, enums, and indexes exist.
 * Fully idempotent and safe for both fresh databases and existing production schemas.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Ensure enum_users_role has all required tenant roles
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type typ
          JOIN pg_enum enm ON typ.oid = enm.enumtypid
          WHERE typ.typname = 'enum_users_role' AND enm.enumlabel = 'administrator'
        ) THEN
          ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'administrator';
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_type typ
          JOIN pg_enum enm ON typ.oid = enm.enumtypid
          WHERE typ.typname = 'enum_users_role' AND enm.enumlabel = 'accountant'
        ) THEN
          ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'accountant';
        END IF;
      EXCEPTION
        WHEN undefined_object THEN NULL;
      END $$;
    `).catch(() => {});

    // 2. If fresh database, sync models with IF NOT EXISTS (without force or alter)
    // We import models to ensure all base tables exist if deploying to a completely empty DB
    try {
      const db = require('../models');
      const modelNames = [
        'Clinic', 'User', 'Doctor', 'Patient', 'Appointment',
        'Invoice', 'Odontogram', 'OdontogramHistory', 'Notification',
        'Service', 'TreatmentPlan', 'Payment', 'MedicalRecord',
        'LabOrder', 'Inventory', 'ClinicApplication'
      ];

      for (const name of modelNames) {
        if (db[name] && typeof db[name].sync === 'function') {
          // model.sync() issues CREATE TABLE IF NOT EXISTS in Sequelize
          await db[name].sync();
        }
      }
    } catch (err) {
      console.warn('Baseline model sync warning (schema may already exist):', err.message);
    }

    // 3. Multi-tenant indexes for lightning-fast tenant-scoped lookups
    const tables = [
      'users', 'patients', 'appointments', 'invoices',
      'payments', 'inventory', 'services', 'medical_records',
      'treatment_plans', 'lab_orders', 'notifications'
    ];

    for (const table of tables) {
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '${table}') THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = '${table}' AND column_name = 'clinicId') THEN
              CREATE INDEX IF NOT EXISTS "idx_${table}_clinic_id" ON "${table}" ("clinicId");
            END IF;
          END IF;
        END $$;
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
