const ReportLog = require('../models/ReportLog');
const sequelize = require('../config/db');
const { buildMemberReportSummary } = require('../utils/memberReport');

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

const getMemberReport = async (req, res) => {
  try {
    const { memberId } = req.params;

    const [members] = await sequelize.query(
      `SELECT * FROM members WHERE id = :memberId`,
      { replacements: { memberId } }
    );

    if (!members[0]) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const member = members[0];
    const [tithes] = await sequelize.query(
      `SELECT * FROM tithes WHERE member_id = :memberId ORDER BY date_paid DESC`,
      { replacements: { memberId } }
    );
    const [welfare] = await sequelize.query(
      `SELECT * FROM welfare_contributions WHERE member_id = :memberId ORDER BY date_paid DESC`,
      { replacements: { memberId } }
    );

    let offerings = [];
    try {
      const offeringsTable = await sequelize.getQueryInterface().describeTable('offerings');
      if (offeringsTable.member_id) {
        const rows = await sequelize.query(
          `SELECT * FROM offerings WHERE member_id = :memberId ORDER BY date_collected DESC`,
          { replacements: { memberId } }
        );
        offerings = rows[0] || [];
      }
    } catch {
      offerings = [];
    }

    const [attendance] = await sequelize.query(
      `SELECT * FROM attendance WHERE member_id = :memberId ORDER BY service_date DESC`,
      { replacements: { memberId } }
    );

    const summary = buildMemberReportSummary(member, { tithes, welfare, offerings, attendance });
    res.json(summary);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to fetch member report' });
  }
};

const getMemberReportBySearch = async (req, res) => {
  try {
    const query = (req.query.query || '').trim();
    if (!query) {
      return res.status(400).json({ message: 'Member name or ID is required' });
    }

    const searchTerm = `%${query}%`;
    const [members] = await sequelize.query(
      `SELECT *
       FROM members
       WHERE CAST(id AS TEXT) = :query
          OR membership_id ILIKE :searchTerm
          OR full_name ILIKE :searchTerm
       ORDER BY full_name ASC
       LIMIT 1`,
      { replacements: { query, searchTerm } }
    );

    if (!members[0]) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const member = members[0];
    req.params.memberId = member.id;
    return getMemberReport(req, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to search member report' });
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

module.exports = { getReports, getMemberReport, getMemberReportBySearch, createReport };
