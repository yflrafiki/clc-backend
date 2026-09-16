/**
 * Add a user account securely from the command line.
 *
 * Usage:
 *   node scripts/addAccount.js <full_name> <email> <password> <role_id>
 *
 * Role IDs:
 *   1 = Admin
 *   2 = Members Department
 *   3 = Finance Department
 *   4 = Assistant
 *
 * Example:
 *   node scripts/addAccount.js "John Doe" john@clc.com SecurePass123 4
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../src/config/db');

const ROLES = { 1: 'Admin', 2: 'Members Dept', 3: 'Finance Dept', 4: 'Assistant' };

const [,, full_name, email, password, role_id_raw] = process.argv;

if (!full_name || !email || !password || !role_id_raw) {
  console.error('\n  Usage: node scripts/addAccount.js <full_name> <email> <password> <role_id>\n');
  process.exit(1);
}

const role_id = parseInt(role_id_raw, 10);

if (!ROLES[role_id]) {
  console.error(`\n  Invalid role_id "${role_id_raw}". Must be 1, 2, 3, or 4.\n`);
  process.exit(1);
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error(`\n  Invalid email address: "${email}"\n`);
  process.exit(1);
}

if (password.length < 8) {
  console.error('\n  Password must be at least 8 characters.\n');
  process.exit(1);
}

(async () => {
  try {
    await sequelize.authenticate();

    const [[existing]] = await sequelize.query(
      'SELECT id FROM users WHERE email = :email',
      { replacements: { email } }
    );

    if (existing) {
      console.error(`\n  Account with email "${email}" already exists.\n`);
      process.exit(1);
    }

    const hashed = await bcrypt.hash(password, 12);

    await sequelize.query(
      `INSERT INTO users (full_name, email, password, role_id)
       VALUES (:full_name, :email, :password, :role_id)`,
      { replacements: { full_name, email, password: hashed, role_id } }
    );

    console.log(`\n  ✓ Account created successfully`);
    console.log(`    Name   : ${full_name}`);
    console.log(`    Email  : ${email}`);
    console.log(`    Role   : ${ROLES[role_id]} (${role_id})\n`);
    process.exit(0);
  } catch (err) {
    console.error('\n  Failed to create account:', err.message, '\n');
    process.exit(1);
  }
})();
