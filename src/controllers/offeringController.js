const sequelize = require('../config/db');

const getOfferings = async (req, res) => {
  try {
    const { type } = req.query;
    const whereClause = type ? `WHERE type = :type` : '';
    const [rows] = await sequelize.query(
      `SELECT * FROM offerings ${whereClause} ORDER BY id DESC`,
      { replacements: type ? { type } : {} }
    );
    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to fetch offerings' });
  }
};

const createOffering = async (req, res) => {
  try {
    const { type, amount, payment_method, date_collected, notes } = req.body;
    const recorded_by = req.user?.id || null;

    await sequelize.query(
      `INSERT INTO offerings (type, amount, payment_method, date_collected, notes, recorded_by)
       VALUES (:type, :amount, :payment_method, :date_collected, :notes, :recorded_by)`,
      { replacements: { type, amount, payment_method: payment_method || 'Cash', date_collected, notes, recorded_by } }
    );

    res.status(201).json({ message: `${type} recorded successfully` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to record offering' });
  }
};

const getOfferingSummary = async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT type,
        COUNT(*) as count,
        SUM(amount) as total
      FROM offerings
      GROUP BY type
    `);
    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to fetch summary' });
  }
};

module.exports = { getOfferings, createOffering, getOfferingSummary };
