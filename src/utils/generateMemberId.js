const sequelize = require('../config/db');

const generateMemberId = async (dateJoined) => {
  const year = dateJoined
    ? new Date(dateJoined).getFullYear()
    : new Date().getFullYear();

  const [rows] = await sequelize.query(
    `SELECT COUNT(*) as count FROM members WHERE membership_id LIKE :pattern`,
    { replacements: { pattern: `LC/${year}/%` } }
  );

  const count = parseInt(rows[0].count, 10) + 1;
  const seq = String(count).padStart(3, '0');

  return `LC/${year}/${seq}`;
};

module.exports = generateMemberId;
