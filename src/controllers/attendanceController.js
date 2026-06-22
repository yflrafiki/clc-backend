const Attendance = require('../models/Attendance');

exports.markAttendance = async (req, res) => {
  try {
    const { member_id } = req.body;

    const today = new Date().toISOString().split('T')[0];

    const existing = await Attendance.findOne({
      where: {
        member_id,
        service_date: today
      }
    });

    if (existing) {
      return res.status(400).json({
        message: 'Attendance already recorded today'
      });
    }

    const attendance = await Attendance.create({
      member_id,
      service_date: today,
      attendance_status: true
    });

    res.status(201).json(attendance);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};