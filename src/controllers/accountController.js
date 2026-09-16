const sequelize = require('../config/db');
const BankReceipt = require('../models/BankReceipt');
const path = require('path');

const getFinancialSummary = async (req, res) => {
  try {
    const [tithe] = await sequelize.query(`SELECT COALESCE(SUM(amount),0) as total FROM tithes`);
    const [welfare] = await sequelize.query(`SELECT COALESCE(SUM(amount),0) as total FROM welfare_contributions`);
    const [offerings] = await sequelize.query(`
      SELECT type, COALESCE(SUM(amount),0) as total
      FROM offerings GROUP BY type
    `);

    const offeringMap = {};
    offerings.forEach(o => { offeringMap[o.type] = Number(o.total); });

    res.json({
      tithe: Number(tithe[0].total),
      welfare: Number(welfare[0].total),
      offering: offeringMap['Offering'] || 0,
      donation: offeringMap['Donation'] || 0,
      seed: offeringMap['Seed'] || 0,
      grand_total:
        Number(tithe[0].total) +
        Number(welfare[0].total) +
        (offeringMap['Offering'] || 0) +
        (offeringMap['Donation'] || 0) +
        (offeringMap['Seed'] || 0)
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to fetch financial summary' });
  }
};

const getReceipts = async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT b.*, u.full_name as uploaded_by_name
      FROM bank_receipts b
      LEFT JOIN users u ON b.uploaded_by = u.id
      ORDER BY b."createdAt" DESC
    `);
    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to fetch receipts' });
  }
};

const uploadReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Receipt image is required' });
    }

    const { category, amount, bank_name, transaction_date, notes } = req.body;
    const uploaded_by = req.user?.id || null;
    const receipt_image = req.file.filename;

    await BankReceipt.create({
      category,
      amount,
      bank_name,
      transaction_date,
      notes,
      receipt_image,
      uploaded_by
    });

    res.status(201).json({ message: 'Receipt uploaded successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to upload receipt' });
  }
};

module.exports = { getFinancialSummary, getReceipts, uploadReceipt };
