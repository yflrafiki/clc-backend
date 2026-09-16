require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../src/config/db');

const accounts = [
  { full_name: 'Admin',              email: 'admin@clc.com',    password: 'admin123',    role_id: 1 },
  { full_name: 'Members Department', email: 'members@clc.com',  password: 'members123',  role_id: 2 },
  { full_name: 'Finance Department', email: 'finance@clc.com',  password: 'finance123',  role_id: 3 },
  { full_name: 'Assistant',          email: 'assistant@clc.com',password: 'assistant123',role_id: 4 },
];

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected');

    for (const acc of accounts) {
      const hashed = await bcrypt.hash(acc.password, 10);
      await sequelize.query(
        `INSERT INTO users (full_name, email, password, role_id)
         VALUES (:full_name, :email, :password, :role_id)
         ON CONFLICT (email) DO UPDATE SET role_id = :role_id`,
        { replacements: { ...acc, password: hashed } }
      );
      console.log(`✓ ${acc.full_name} (role ${acc.role_id})`);
    }

    console.log('\nDone. Accounts ready.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
