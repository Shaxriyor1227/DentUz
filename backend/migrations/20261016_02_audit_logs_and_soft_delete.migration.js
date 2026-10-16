const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    // 1. Create audit_logs table
    await queryInterface.createTable('audit_logs', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      clinicId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'clinics', key: 'id' },
        onDelete: 'SET NULL',
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      userEmail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userRole: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      action: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      resource: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      resourceId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ip: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    }).catch(() => {});

    // Create audit log indexes
    await queryInterface.addIndex('audit_logs', ['clinicId']).catch(() => {});
    await queryInterface.addIndex('audit_logs', ['userId']).catch(() => {});
    await queryInterface.addIndex('audit_logs', ['resource', 'resourceId']).catch(() => {});
    await queryInterface.addIndex('audit_logs', ['createdAt']).catch(() => {});

    // 2. Add deletedAt for soft delete (paranoid)
    const softDeleteTables = ['patients', 'payments', 'invoices'];
    for (const table of softDeleteTables) {
      await queryInterface.sequelize.query(`
        ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMPTZ;
      `).catch(() => {});
    }
  },

  down: async (queryInterface) => {
    // Rollback: drop audit_logs and soft delete columns
    await queryInterface.dropTable('audit_logs').catch(() => {});
    const softDeleteTables = ['patients', 'payments', 'invoices'];
    for (const table of softDeleteTables) {
      await queryInterface.sequelize.query(`
        ALTER TABLE "${table}" DROP COLUMN IF EXISTS "deletedAt";
      `).catch(() => {});
    }
  },
};
