const ReportLog = require('../models/ReportLog');
const sequelize = require('../config/db');

const getReports = async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT r.*, u.full_name as submitted_by_name
      FROM report_logs r
      LEFT JOIN users u ON r.submitted_by = u.id
      ORDER BY r."createdAt" DESC
    `);
    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
};

const createReport = async (req, res) => {
  try {
    const { title, category, content, report_date } = req.body;
    const submitted_by = req.user?.id || null;

    await ReportLog.create({ title, category, content, report_date, submitted_by });

    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to submit report' });
  }
};

module.exports = { getReports, createReport };
