const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const SUPABASE_URL = 'postgresql://postgres.aufmxtluidprpxagisuf:27112007noyabR%40@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

const sequelize = new Sequelize(SUPABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function main() {
  console.log('Connecting to Supabase...');
  await sequelize.authenticate();
  console.log('Connected!');

  const hashedPassword = await bcrypt.hash('27112007noyabR@', 12);
  const now = new Date();
  const id = randomUUID();

  // Create or Update Superadmin
  const [existing] = await sequelize.query(
    'SELECT id, email, username FROM users WHERE email = :email OR username = :username',
    { replacements: { email: 'shaxriyorrozmamatov@dentuz.uz', username: 'shaxriyorrozmamatov' } }
  );

  if (existing.length > 0) {
    await sequelize.query(
      'UPDATE users SET password = :password, role = :role, "isActive" = true, "updatedAt" = :now WHERE id = :id',
      { replacements: { password: hashedPassword, role: 'superadmin', now, id: existing[0].id } }
    );
    console.log('Updated existing superadmin in Supabase:', existing[0].email);
  } else {
    await sequelize.query(
      `INSERT INTO users (id, name, "shortName", title, email, username, password, role, "isActive", "createdAt", "updatedAt")
       VALUES (:id, :name, :shortName, :title, :email, :username, :password, :role, :isActive, :createdAt, :updatedAt)`,
      {
        replacements: {
          id,
          name: 'Shaxriyor Rozmamatov',
          shortName: 'Sh. Rozmamatov',
          title: 'Bosh Boshqaruvchi • SuperAdmin',
          email: 'shaxriyorrozmamatov@dentuz.uz',
          username: 'shaxriyorrozmamatov',
          password: hashedPassword,
          role: 'superadmin',
          isActive: true,
          createdAt: now,
          updatedAt: now
        }
      }
    );
    console.log('Created NEW superadmin in Supabase: shaxriyorrozmamatov');
  }

  // Double check
  const [users] = await sequelize.query('SELECT id, email, username, role FROM users');
  console.log('Users now in Supabase:', users);
  process.exit(0);
}

main().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
