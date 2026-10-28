const { Op } = require('sequelize');
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const Visitor = require('../models/Visitor');
const SERVICES = require('../config/services');

const TREND_WEEKS = 8;

const toDateString = (d) => d.toISOString().split('T')[0];

// The given date's Sunday on or before it (UTC, matching how check-ins store service_date)
const sundayOnOrBefore = (dateString) => {
  const d = dateString ? new Date(`${dateString}T12:00:00Z`) : new Date();
  if (Number.isNaN(d.getTime())) return sundayOnOrBefore();
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return toDateString(d);
};

const shiftDays = (dateString, days) => {
  const d = new Date(`${dateString}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return toDateString(d);
};

// Members present and visitors for each of the last TREND_WEEKS Sundays, oldest first
const buildTrend = async (date) => {
  const dates = Array.from({ length: TREND_WEEKS }, (_, i) => shiftDays(date, -7 * (TREND_WEEKS - 1 - i)));

  const records = await Attendance.findAll({
    where: { service_date: { [Op.in]: dates } },
    attributes: ['service_date', 'member_id']
  });
  const visitors = await Visitor.findAll({
    where: { service_date: { [Op.in]: dates } },
    attributes: ['service_date']
  });

  return dates.map((d) => ({
    date: d,
    members: new Set(records.filter((r) => r.service_date === d).map((r) => r.member_id)).size,
    visitors: visitors.filter((v) => v.service_date === d).length
  }));
};

const buildWeeklyAttendanceReport = async (dateString) => {
  const date = sundayOnOrBefore(dateString);

  const activeMembers = await Member.findAll({
    where: { [Op.or]: [{ status: { [Op.ne]: 'Inactive' } }, { status: null }] },
    attributes: ['id', 'membership_id', 'full_name', 'phone_number'],
    order: [['full_name', 'ASC']]
  });

  const records = await Attendance.findAll({ where: { service_date: date } });
  const visitors = await Visitor.findAll({ where: { service_date: date }, order: [['checked_in_at', 'ASC']] });
  const trend = await buildTrend(date);

  const present = new Set(records.map((r) => r.member_id));
  const previous = trend[trend.length - 2];

  const serviceNames = [...new Set([
    ...SERVICES,
    ...records.map((r) => r.service || SERVICES[0]),
    ...visitors.map((v) => v.service || SERVICES[0])
  ])];

  const services = serviceNames
    .map((name) => {
      const rows = records.filter((r) => (r.service || SERVICES[0]) === name);
      return {
        name,
        members: rows.length,
        qr: rows.filter((r) => r.check_in_method === 'qr').length,
        desk: rows.filter((r) => r.check_in_method !== 'qr').length,
        visitors: visitors.filter((v) => (v.service || SERVICES[0]) === name).length
      };
    })
    .filter((s) => s.members > 0 || s.visitors > 0);

  return {
    date,
    isCurrentWeek: date === sundayOnOrBefore(),
    activeMembers: activeMembers.length,
    membersPresent: present.size,
    previousMembersPresent: previous ? previous.members : 0,
    attendanceRate: activeMembers.length ? Math.round((present.size / activeMembers.length) * 100) : 0,
    visitors: visitors.length,
    firstTimers: visitors
      .filter((v) => v.first_time)
      .map((v) => ({ id: v.id, full_name: v.full_name, phone_number: v.phone_number, service: v.service })),
    services,
    trend,
    absent: activeMembers
      .filter((m) => !present.has(m.id))
      .map((m) => ({ id: m.id, membership_id: m.membership_id, full_name: m.full_name, phone_number: m.phone_number }))
  };
};

module.exports = { buildWeeklyAttendanceReport, sundayOnOrBefore };
