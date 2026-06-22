const sequelize = require('../config/db');

const getContributions = async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT w.*, m.full_name
      FROM welfare_contributions w
      JOIN members m ON w.member_id = m.id
      ORDER BY w.id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to fetch contributions' });
  }
};

const createContribution = async (req, res) => {
  try {
    const { member_id, amount, purpose, date_paid } = req.body;
    await sequelize.query(
      `INSERT INTO welfare_contributions (member_id, amount, purpose, date_paid)
       VALUES (:member_id, :amount, :purpose, :date_paid)`,
      { replacements: { member_id, amount, purpose, date_paid: date_paid || new Date() } }
    );
    res.status(201).json({ message: 'Contribution saved successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to save contribution' });
  }
};

module.exports = { getContributions, createContribution };
