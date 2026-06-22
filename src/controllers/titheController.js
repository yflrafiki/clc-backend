const sequelize = require('../config/db');

const getTithes = async (req, res) => {
  try {

    const [rows] = await sequelize.query(`
      SELECT
        t.*,
        m.full_name
      FROM tithes t
      JOIN members m
      ON t.member_id = m.id
      ORDER BY t.id DESC
    `);

    res.json(rows);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: 'Failed to fetch tithes'
    });

  }
};

const createTithe = async (req, res) => {

  try {

    const {
      member_id,
      amount,
      payment_method,
      notes
    } = req.body;

    await sequelize.query(
      `
      INSERT INTO tithes
      (
        member_id,
        amount,
        payment_method,
        date_paid,
        notes
      )
      VALUES
      (
        :member_id,
        :amount,
        :payment_method,
        CURRENT_DATE,
        :notes
      )
      `,
      {
        replacements: {
          member_id,
          amount,
          payment_method,
          notes
        }
      }
    );

    res.status(201).json({
      message: 'Tithe saved successfully'
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: 'Failed to save tithe'
    });

  }
};

module.exports = {
  getTithes,
  createTithe
};