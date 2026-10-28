const { buildWeeklyAttendanceReport } = require('../utils/weeklyAttendanceReport');

// Admin dashboard: attendance for the Sunday on or before ?date=YYYY-MM-DD (default: latest Sunday)
exports.getWeeklyAttendanceReport = async (req, res) => {
  try {
    const report = await buildWeeklyAttendanceReport(req.query.date);
    res.status(200).json(report);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to load the weekly attendance report' });
  }
};
