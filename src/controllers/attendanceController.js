const { Op } = require('sequelize');
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const Visitor = require('../models/Visitor');
const SERVICES = require('../config/services');

const today = () => new Date().toISOString().split('T')[0];

const pickService = (service) => {
  if (!service) return SERVICES[0];
  return SERVICES.includes(service) ? service : null;
};

const recordMember = async (member, service, method) => {
  const service_date = today();

  const existing = await Attendance.findOne({
    where: { member_id: member.id, service_date, service }
  });

  if (existing) return { attendance: existing, already: true };

  const attendance = await Attendance.create({
    member_id: member.id,
    service_date,
    service,
    check_in_method: method,
    attendance_status: true
  });

  return { attendance, already: false };
};

// Front desk marks a member present (staff only)
exports.markAttendance = async (req, res) => {
  try {
    const { member_id } = req.body;
    const service = pickService(req.body.service);

    if (!service) return res.status(400).json({ message: 'Unknown service' });

    const member = await Member.findByPk(member_id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const { attendance, already } = await recordMember(member, service, 'front_desk');

    if (already) {
      return res.status(400).json({
        message: `Attendance already recorded for ${service} today`
      });
    }

    res.status(201).json(attendance);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Public: list of services for the check-in page
exports.getServices = (req, res) => {
  res.status(200).json(SERVICES);
};

// Public: a member scans the QR code and enters their membership ID
exports.selfCheckIn = async (req, res) => {
  try {
    const membership_id = String(req.body.membership_id || '')
      .replace(/\s+/g, '')
      .toUpperCase();
    const service = pickService(req.body.service);

    if (!membership_id) return res.status(400).json({ message: 'Enter your member ID.' });
    if (!service) return res.status(400).json({ message: 'Choose a service.' });

    const member = await Member.findOne({ where: { membership_id } });

    if (!member) {
      return res.status(404).json({
        message: `We couldn't find member ID ${membership_id}. Check it and try again, or ask the front desk.`
      });
    }

    const { already } = await recordMember(member, service, 'qr');

    // Only the first name goes back, so the page doesn't reveal full member details
    res.status(already ? 200 : 201).json({
      first_name: member.full_name.split(' ')[0],
      service,
      already
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Check-in failed. Please try again or see the front desk.' });
  }
};

// Public: a visitor checks in with their name and phone number
exports.visitorCheckIn = async (req, res) => {
  try {
    const full_name = String(req.body.full_name || '').trim();
    const phone_number = String(req.body.phone_number || '').trim();
    const first_time = Boolean(req.body.first_time);
    const service = pickService(req.body.service);
    const service_date = today();

    if (!full_name) return res.status(400).json({ message: 'Enter your full name.' });
    if (!service) return res.status(400).json({ message: 'Choose a service.' });

    if (phone_number) {
      const existing = await Visitor.findOne({
        where: { phone_number, service_date, service }
      });

      if (existing) {
        return res.status(200).json({ first_name: full_name.split(' ')[0], service, already: true });
      }
    }

    await Visitor.create({ full_name, phone_number, first_time, service, service_date });

    res.status(201).json({ first_name: full_name.split(' ')[0], service, already: false });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Check-in failed. Please try again or see the front desk.' });
  }
};

// Staff: everyone checked in today, members and visitors
exports.getToday = async (req, res) => {
  try {
    const service_date = today();

    const records = await Attendance.findAll({
      where: { service_date },
      order: [['checked_in_at', 'DESC']]
    });

    const members = await Member.findAll({
      where: { id: { [Op.in]: records.map((r) => r.member_id) } },
      attributes: ['id', 'membership_id', 'full_name']
    });
    const byId = new Map(members.map((m) => [m.id, m]));

    const visitors = await Visitor.findAll({
      where: { service_date },
      order: [['checked_in_at', 'DESC']]
    });

    res.status(200).json({
      date: service_date,
      services: SERVICES,
      members: records.map((r) => ({
        id: r.id,
        member_id: r.member_id,
        membership_id: byId.get(r.member_id)?.membership_id || null,
        full_name: byId.get(r.member_id)?.full_name || 'Unknown member',
        service: r.service || SERVICES[0],
        check_in_method: r.check_in_method,
        checked_in_at: r.checked_in_at
      })),
      visitors
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to load today\'s attendance' });
  }
};
