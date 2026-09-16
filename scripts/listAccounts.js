/**
 * List all user accounts (no passwords shown).
 *
 * Usage:
 *   node scripts/listAccounts.js
 */

require('dotenv').config();
const sequelize = require('../src/config/db');

const ROLES = { 1: 'Admin', 2: 'Members Dept', 3: 'Finance Dept', 4: 'Assistant' };

(async () => {
  try {
    await sequelize.authenticate();

    const [users] = await sequelize.query(
      'SELECT id, full_name, email, role_id FROM users ORDER BY role_id, id'
    );

    if (users.length === 0) {
      console.log('\n  No accounts found.\n');
      process.exit(0);
    }

    console.log(`\n  ${'ID'.padEnd(5)} ${'Role'.padEnd(16)} ${'Name'.padEnd(25)} Email`);
    console.log(`  ${'─'.repeat(70)}`);
    users.forEach(u => {
      const role = (ROLES[u.role_id] || `Role ${u.role_id}`).padEnd(16);
      const name = (u.full_name || '').padEnd(25);
      console.log(`  ${String(u.id).padEnd(5)} ${role} ${name} ${u.email}`);
    });
    console.log();
    process.exit(0);
  } catch (err) {
    console.error('\n  Failed to list accounts:', err.message, '\n');
    process.exit(1);
  }
})();
