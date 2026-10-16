/**
 * Performance Optimization Migration: 20261016_04_performance_indexes
 * Implements composite and partial indexes for multi-tenant soft-deleted queries.
 * Dramatically speeds up listing, filtering, and counting queries on high-traffic models.
 */
module.exports = {
  up: async (queryInterface) => {
    const indexConfigs = [
      {
        table: 'patients',
        name: 'idx_patients_clinic_status_active',
        columns: '"clinicId", "status"',
      },
      {
        table: 'patients',
        name: 'idx_patients_clinic_created',
        columns: '"clinicId", "createdAt" DESC',
      },
      {
        table: 'appointments',
        name: 'idx_appointments_clinic_date_active',
        columns: '"clinicId", "date", "time"',
      },
      {
        table: 'appointments',
        name: 'idx_appointments_clinic_status_active',
        columns: '"clinicId", "status"',
      },
      {
        table: 'invoices',
        name: 'idx_invoices_clinic_status_active',
        columns: '"clinicId", "status"',
      },
      {
        table: 'medical_records',
        name: 'idx_medical_records_clinic_patient_active',
        columns: '"clinicId", "patientId"',
      },
      {
        table: 'audit_logs',
        name: 'idx_audit_logs_clinic_created',
        columns: '"clinicId", "createdAt" DESC',
        skipSoftDelete: true,
      },
    ];

    for (const cfg of indexConfigs) {
      await queryInterface.sequelize.query(`
        DO $$
        DECLARE
          has_deleted BOOLEAN;
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '${cfg.table}') THEN
            SELECT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = '${cfg.table}' AND column_name = 'deletedAt'
            ) INTO has_deleted;

            IF has_deleted AND '${cfg.skipSoftDelete || false}' = 'false' THEN
              EXECUTE 'CREATE INDEX IF NOT EXISTS "${cfg.name}" ON "${cfg.table}" (${cfg.columns}) WHERE "deletedAt" IS NULL';
            ELSE
              EXECUTE 'CREATE INDEX IF NOT EXISTS "${cfg.name}" ON "${cfg.table}" (${cfg.columns})';
            END IF;
          END IF;
        END $$;
      `).catch((err) => {
        console.warn(`Index ${cfg.name} yaratishda ogohlantirish:`, err.message);
      });
    }
  },

  down: async (queryInterface) => {
    const indexes = [
      { table: 'patients', name: 'idx_patients_clinic_status_active' },
      { table: 'patients', name: 'idx_patients_clinic_created' },
      { table: 'appointments', name: 'idx_appointments_clinic_date_active' },
      { table: 'appointments', name: 'idx_appointments_clinic_status_active' },
      { table: 'invoices', name: 'idx_invoices_clinic_status_active' },
      { table: 'medical_records', name: 'idx_medical_records_clinic_patient_active' },
      { table: 'audit_logs', name: 'idx_audit_logs_clinic_created' },
    ];

    for (const idx of indexes) {
      await queryInterface.sequelize.query(`DROP INDEX IF EXISTS "${idx.name}";`).catch(() => {});
    }
  },
};
