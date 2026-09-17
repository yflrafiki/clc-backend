const sequelize = require('../config/db');

const getOfferings = async (req, res) => {
  try {
    const { type } = req.query;
    const whereClause = type ? `WHERE o.type = :type` : '';
    const [rows] = await sequelize.query(
      `SELECT o.*, m.full_name, m.membership_id
       FROM offerings o
       LEFT JOIN members m ON m.id = o.member_id
       ${whereClause}
       ORDER BY o.id DESC`,
      { replacements: type ? { type } : {} }
    );
    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to fetch offerings' });
  }
};

const getMemberOfferings = async (req, res) => {
  try {
    const { memberId } = req.params;
    const [rows] = await sequelize.query(
      `SELECT o.*, m.full_name, m.membership_id
       FROM offerings o
       LEFT JOIN members m ON m.id = o.member_id
       WHERE o.member_id = :memberId
       ORDER BY o.date_collected DESC, o.id DESC`,
      { replacements: { memberId } }
    );
    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to fetch member offerings' });
  }
};

const createOffering = async (req, res) => {
  try {
    const { type, amount, payment_method, date_collected, notes, member_id } = req.body;
    const recorded_by = req.user?.id || null;

    const insertValues = { type, amount, payment_method: payment_method || 'Cash', date_collected, notes, recorded_by };

    const columns = ['type', 'amount', 'payment_method', 'date_collected', 'notes', 'recorded_by'];
    const placeholders = [':type', ':amount', ':payment_method', ':date_collected', ':notes', ':recorded_by'];

    try {
      const offeringsTable = await sequelize.getQueryInterface().describeTable('offerings');
      if (offeringsTable.member_id) {
        columns.push('member_id');
        placeholders.push(':member_id');
        insertValues.member_id = member_id || null;
      }
    } catch {
      // Ignore if this older schema does not yet have member_id.
    }

    await sequelize.query(
      `INSERT INTO offerings (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
      { replacements: insertValues }
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

module.exports = { getOfferings, getMemberOfferings, createOffering, getOfferingSummary };
