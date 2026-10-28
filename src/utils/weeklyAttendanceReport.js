const { Op } = require('sequelize');
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const Visitor = require('../models/Visitor');
const SERVICES = require('../config/services');

const ABSENT_LIST_LIMIT = 100;

const toDateString = (d) => d.toISOString().split('T')[0];

// The given date's Sunday on or before it (UTC, matching how check-ins store service_date)
const sundayOnOrBefore = (dateString) => {
  const d = dateString ? new Date(`${dateString}T12:00:00Z`) : new Date();
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return toDateString(d);
};

const shiftDays = (dateString, days) => {
  const d = new Date(`${dateString}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return toDateString(d);
};

const presentMemberIds = async (service_date) => {
  const rows = await Attendance.findAll({ where: { service_date }, attributes: ['member_id'] });
  return new Set(rows.map((r) => r.member_id));
};

const buildWeeklyAttendanceReport = async (dateString) => {
  const date = sundayOnOrBefore(dateString);
  const previousDate = shiftDays(date, -7);

  const activeMembers = await Member.findAll({
    where: { [Op.or]: [{ status: { [Op.ne]: 'Inactive' } }, { status: null }] },
    attributes: ['id', 'membership_id', 'full_name', 'phone_number'],
    order: [['full_name', 'ASC']]
  });

  const records = await Attendance.findAll({ where: { service_date: date } });
  const visitors = await Visitor.findAll({ where: { service_date: date }, order: [['checked_in_at', 'ASC']] });

  const present = new Set(records.map((r) => r.member_id));
  const previousPresent = await presentMemberIds(previousDate);

  const serviceNames = [...new Set([
    ...SERVICES,
    ...records.map((r) => r.service || SERVICES[0]),
    ...visitors.map((v) => v.service || SERVICES[0])
  ])];

  const services = serviceNames
    .map((name) => {
      const rows = records.filter((r) => (r.service || SERVICES[0]) === name);
      const serviceVisitors = visitors.filter((v) => (v.service || SERVICES[0]) === name);
      return {
        name,
        members: rows.length,
        qr: rows.filter((r) => r.check_in_method === 'qr').length,
        desk: rows.filter((r) => r.check_in_method !== 'qr').length,
        visitors: serviceVisitors.length
      };
    })
    .filter((s) => s.members > 0 || s.visitors > 0);

  const absent = activeMembers.filter((m) => !present.has(m.id));

  return {
    date,
    previousDate,
    activeMembers: activeMembers.length,
    membersPresent: present.size,
    previousMembersPresent: previousPresent.size,
    attendanceRate: activeMembers.length ? Math.round((present.size / activeMembers.length) * 100) : 0,
    visitors: visitors.length,
    firstTimers: visitors
      .filter((v) => v.first_time)
      .map((v) => ({ full_name: v.full_name, phone_number: v.phone_number, service: v.service })),
    services,
    absentCount: absent.length,
    absent: absent.slice(0, ABSENT_LIST_LIMIT).map((m) => ({
      membership_id: m.membership_id,
      full_name: m.full_name,
      phone_number: m.phone_number
    }))
  };
};

const escape = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const longDate = (dateString) => new Date(`${dateString}T12:00:00Z`)
  .toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

const cell = 'padding:8px 10px;border-bottom:1px solid #efe4d5;font-size:14px;';
const head = 'padding:8px 10px;border-bottom:2px solid #e7d9bd;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#6d5d55;text-align:left;';

const table = (headers, rows) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 22px;">
    <tr>${headers.map((h) => `<th style="${head}">${escape(h)}</th>`).join('')}</tr>
    ${rows.map((r) => `<tr>${r.map((v) => `<td style="${cell}">${escape(v)}</td>`).join('')}</tr>`).join('')}
  </table>`;

const stat = (label, value, note) => `
  <td style="padding:6px;width:33%;vertical-align:top;">
    <div style="background:#f9f1eb;border:1px solid #e6d9c3;border-radius:12px;padding:14px;text-align:center;">
      <div style="font-size:26px;font-weight:bold;color:#1f2d3d;">${escape(value)}</div>
      <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#6d5d55;">${escape(label)}</div>
      ${note ? `<div style="margin-top:4px;font-size:12px;color:#5d554d;">${escape(note)}</div>` : ''}
    </div>
  </td>`;

const section = (title) => `<h2 style="margin:8px 0 4px;font-family:Georgia,serif;font-size:20px;font-weight:normal;color:#1f2d3d;">${escape(title)}</h2>`;

// Email body, inserted into the EmailJS template with {{{report_html}}}
const renderWeeklyAttendanceReport = (report) => {
  const change = report.membersPresent - report.previousMembersPresent;
  const changeNote = `${change >= 0 ? '+' : ''}${change} vs previous Sunday`;

  if (report.membersPresent === 0 && report.visitors === 0) {
    return `<p style="font-size:15px;color:#1f2d3d;">No check-ins were recorded for ${escape(longDate(report.date))}.</p>`;
  }

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
      <tr>
        ${stat('Members present', `${report.membersPresent} / ${report.activeMembers}`, `${report.attendanceRate}% · ${changeNote}`)}
        ${stat('Visitors', report.visitors, `${report.firstTimers.length} first time`)}
        ${stat('Absent', report.absentCount, 'active members')}
      </tr>
    </table>

    ${section('By service')}
    ${table(['Service', 'Members', 'By QR', 'At desk', 'Visitors'],
      report.services.map((s) => [s.name, s.members, s.qr, s.desk, s.visitors]))}

    ${section('First-time visitors to follow up')}
    ${report.firstTimers.length
      ? table(['Name', 'Phone', 'Service'], report.firstTimers.map((v) => [v.full_name, v.phone_number || '—', v.service]))
      : '<p style="margin:4px 0 22px;font-size:14px;color:#5d554d;">No first-time visitors this Sunday.</p>'}

    ${section(`Members absent (${report.absentCount})`)}
    ${report.absentCount
      ? table(['Member ID', 'Name', 'Phone'], report.absent.map((m) => [m.membership_id || '—', m.full_name, m.phone_number || '—']))
        + (report.absentCount > report.absent.length
          ? `<p style="margin:-14px 0 22px;font-size:12px;color:#7d6a5d;">Showing the first ${report.absent.length}. See the Attendance page for everyone.</p>`
          : '')
      : '<p style="margin:4px 0 22px;font-size:14px;color:#5d554d;">Every active member was present.</p>'}
  `;
};

module.exports = { buildWeeklyAttendanceReport, renderWeeklyAttendanceReport, longDate, sundayOnOrBefore };
