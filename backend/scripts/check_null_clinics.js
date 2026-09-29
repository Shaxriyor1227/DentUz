const db = require('../models');

async function checkNullClinicIds() {
  await db.sequelize.authenticate();
  console.log('Database connected.');

  const results = [];

  for (const modelName of Object.keys(db)) {
    if (modelName === 'sequelize' || modelName === 'Sequelize') continue;
    const Model = db[modelName];
    if (!Model || !Model.rawAttributes) continue;

    const hasClinicId = Boolean(Model.rawAttributes.clinicId);
    if (!hasClinicId) {
      results.push({
        Model: modelName,
        Table: Model.tableName || '-',
        HasClinicId: 'YOQ',
        Total: '-',
        NullCount: '-',
        NotNullCount: '-'
      });
      continue;
    }

    const total = await Model.count();
    const nullCount = await Model.count({ where: { clinicId: null } });
    const notNullCount = total - nullCount;

    results.push({
      Model: modelName,
      Table: Model.tableName,
      HasClinicId: 'HA',
      Total: total,
      NullCount: nullCount,
      NotNullCount: notNullCount
    });
  }

  console.table(results);
  process.exit(0);
}

checkNullClinicIds().catch((err) => {
  console.error(err);
  process.exit(1);
});
