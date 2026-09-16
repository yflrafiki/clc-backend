const sequelize = require('../config/db');
const { sendPaymentNotification } = require('../services/notificationService');

const getTithes = async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT t.*, m.full_name, m.membership_id
      FROM tithes t
      JOIN members m ON t.member_id = m.id
      ORDER BY t.id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to fetch tithes' });
  }
};

const createTithe = async (req, res) => {
  try {
    const { member_id, amount, payment_method, notes, date_paid } = req.body;

    await sequelize.query(
      `INSERT INTO tithes (member_id, amount, payment_method, date_paid, notes)
       VALUES (:member_id, :amount, :payment_method, :date_paid, :notes)`,
      { replacements: { member_id, amount, payment_method, notes, date_paid: date_paid || new Date() } }
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
        type: 'Tithe',
        amount,
        datePaid: date_paid || new Date()
      }).catch((err) => {
        const errors = err?.response?.body?.errors;
        console.error('Tithe email failed:', errors ? JSON.stringify(errors) : err.message);
      });
    }

    res.status(201).json({ message: 'Tithe saved successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to save tithe' });
  }
};

const getPaidMembers = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = month || new Date().getMonth() + 1;
    const y = year || new Date().getFullYear();

    const [rows] = await sequelize.query(`
      SELECT DISTINCT m.id, m.membership_id, m.full_name, m.phone_number,
        SUM(t.amount) as total_paid,
        MAX(t.date_paid) as last_paid
      FROM members m
      JOIN tithes t ON t.member_id = m.id
      WHERE EXTRACT(MONTH FROM t.date_paid) = :month
        AND EXTRACT(YEAR FROM t.date_paid) = :year
      GROUP BY m.id, m.membership_id, m.full_name, m.phone_number
      ORDER BY m.full_name
    `, { replacements: { month: m, year: y } });

    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to fetch paid members' });
  }
};

module.exports = { getTithes, createTithe, getPaidMembers };
