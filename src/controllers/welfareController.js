const sequelize = require('../config/db');
const { sendPaymentNotification } = require('../services/notificationService');

const getContributions = async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT w.*, m.full_name, m.membership_id
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

    // Send email notification
    const [members] = await sequelize.query(
      `SELECT full_name, email FROM members WHERE id = :member_id`,
      { replacements: { member_id } }
    );

    if (members[0]?.email) {
      sendPaymentNotification({
        to: members[0].email,
        memberName: members[0].full_name,
        type: 'Welfare',
        amount,
        datePaid: date_paid || new Date()
      }).catch((err) => console.error('Email notification failed:', err?.response?.body?.errors || err.message));
    }

    res.status(201).json({ message: 'Contribution saved successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to save contribution' });
  }
};

const getPaidMembers = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = month || new Date().getMonth() + 1;
    const y = year || new Date().getFullYear();

    const [rows] = await sequelize.query(`
      SELECT DISTINCT m.id, m.membership_id, m.full_name, m.phone_number,
        SUM(w.amount) as total_paid,
        MAX(w.date_paid) as last_paid
      FROM members m
      JOIN welfare_contributions w ON w.member_id = m.id
      WHERE EXTRACT(MONTH FROM w.date_paid) = :month
        AND EXTRACT(YEAR FROM w.date_paid) = :year
      GROUP BY m.id, m.membership_id, m.full_name, m.phone_number
      ORDER BY m.full_name
    `, { replacements: { month: m, year: y } });

    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to fetch paid members' });
  }
};

module.exports = { getContributions, createContribution, getPaidMembers };
