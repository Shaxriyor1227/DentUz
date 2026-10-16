const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ Xatolik: DATABASE_URL muhit o'zgaruvchisi topilmadi. backend/.env faylini tekshiring.");
  process.exit(1);
}

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: dbUrl.includes('localhost') ? {} : {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

async function main() {
  console.log('Connecting to PostgreSQL database via DATABASE_URL...');
  await sequelize.authenticate();
  console.log('✅ Baza bilan aloqa o\'rnatildi!');

  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@dentuz.uz';
  const adminUsername = process.env.ADMIN_SEED_USERNAME || 'superadmin';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'DentUzSuperAdmin2026!';

  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  const now = new Date();
  const id = randomUUID();

  // Create or Update Superadmin
  const [existing] = await sequelize.query(
    'SELECT id, email, username FROM users WHERE email = :email OR username = :username',
    { replacements: { email: adminEmail, username: adminUsername } }
  );

  if (existing.length > 0) {
    await sequelize.query(
      'UPDATE users SET password = :password, role = :role, "isActive" = true, "updatedAt" = :now WHERE id = :id',
      { replacements: { password: hashedPassword, role: 'superadmin', now, id: existing[0].id } }
    );
    console.log(`✅ Mavjud SuperAdmin yangilandi: ${existing[0].email} (role: superadmin)`);
  } else {
    await sequelize.query(
      `INSERT INTO users (id, name, "shortName", title, email, username, password, role, "isActive", "createdAt", "updatedAt")
       VALUES (:id, :name, :shortName, :title, :email, :username, :password, :role, :isActive, :createdAt, :updatedAt)`,
      {
        replacements: {
          id,
          name: 'Platforma SuperAdmin',
          shortName: 'SuperAdmin',
          title: 'Tizim Boshqaruvchisi',
          email: adminEmail,
          username: adminUsername,
          password: hashedPassword,
          role: 'superadmin',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      }
    );
    console.log(`✅ Yangi SuperAdmin yaratildi: ${adminEmail} (login: ${adminUsername})`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ SuperAdmin yaratishda xatolik:', err);
  process.exit(1);
});
