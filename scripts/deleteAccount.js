/**
 * Delete a user account securely from the command line.
 *
 * Usage:
 *   node scripts/deleteAccount.js <email>
 *
 * Example:
 *   node scripts/deleteAccount.js john@clc.com
 */

require('dotenv').config();
const readline = require('readline');
const sequelize = require('../src/config/db');

const [,, email] = process.argv;

if (!email) {
  console.error('\n  Usage: node scripts/deleteAccount.js <email>\n');
  process.exit(1);
}

const confirm = (question) => new Promise((resolve) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question(question, (answer) => { rl.close(); resolve(answer.trim().toLowerCase()); });
});

(async () => {
  try {
    await sequelize.authenticate();

    const [[user]] = await sequelize.query(
      'SELECT id, full_name, email, role_id FROM users WHERE email = :email',
      { replacements: { email } }
    );

    if (!user) {
      console.error(`\n  No account found with email "${email}"\n`);
      process.exit(1);
    }

    const ROLES = { 1: 'Admin', 2: 'Members Dept', 3: 'Finance Dept', 4: 'Assistant' };

    console.log(`\n  Account found:`);
    console.log(`    Name  : ${user.full_name}`);
    console.log(`    Email : ${user.email}`);
    console.log(`    Role  : ${ROLES[user.role_id] || user.role_id}`);

    if (user.role_id === 1) {
      console.error('\n  Cannot delete the Admin account.\n');
      process.exit(1);
    }

    const answer = await confirm('\n  Are you sure you want to delete this account? (yes/no): ');

    if (answer !== 'yes') {
      console.log('\n  Cancelled. No changes made.\n');
      process.exit(0);
    }

    await sequelize.query(
      'DELETE FROM users WHERE email = :email',
      { replacements: { email } }
    );

    console.log(`\n  ✓ Account "${email}" deleted successfully.\n`);
    process.exit(0);
  } catch (err) {
    console.error('\n  Failed to delete account:', err.message, '\n');
    process.exit(1);
  }
})();
