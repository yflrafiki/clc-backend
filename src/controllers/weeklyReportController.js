const crypto = require('crypto');
const {
  buildWeeklyAttendanceReport, renderWeeklyAttendanceReport, longDate
} = require('../utils/weeklyAttendanceReport');
const { sendEmailJs } = require('../services/emailjsService');

const secretMatches = (given) => {
  const expected = process.env.CRON_SECRET;
  if (!expected || !given) return false;
  const a = Buffer.from(String(given));
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// Called every Sunday evening by the GitHub Actions schedule (header: x-cron-secret).
// ?date=YYYY-MM-DD reports on that week's Sunday; ?dry_run=1 returns the email body without sending.
exports.sendWeeklyAttendanceReport = async (req, res) => {
  if (!secretMatches(req.headers['x-cron-secret'])) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const report = await buildWeeklyAttendanceReport(req.query.date);
    const reportHtml = renderWeeklyAttendanceReport(report);

    if (req.query.dry_run) {
      return res.status(200).type('html').send(reportHtml);
    }

    const recipients = process.env.ADMIN_REPORT_EMAIL;
    if (!recipients || !process.env.EMAILJS_REPORT_TEMPLATE_ID) {
      return res.status(500).json({ message: 'ADMIN_REPORT_EMAIL or EMAILJS_REPORT_TEMPLATE_ID is not set' });
    }

    await sendEmailJs(process.env.EMAILJS_REPORT_TEMPLATE_ID, {
      to_email: recipients,
      church_name: 'LifeWay Church',
      report_date: longDate(report.date),
      members_present: report.membersPresent,
      visitors: report.visitors,
      report_html: reportHtml
    });

    res.status(200).json({
      sent_to: recipients,
      date: report.date,
      members_present: report.membersPresent,
      visitors: report.visitors
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `Weekly report failed: ${error.message}` });
  }
};
