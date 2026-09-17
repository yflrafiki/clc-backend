const buildMemberReportSummary = (member, reportData = {}) => {
  const tithes = Array.isArray(reportData.tithes) ? reportData.tithes : [];
  const welfare = Array.isArray(reportData.welfare) ? reportData.welfare : [];
  const offerings = Array.isArray(reportData.offerings) ? reportData.offerings : [];
  const attendance = Array.isArray(reportData.attendance) ? reportData.attendance : [];

  const titheTotal = tithes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const welfareTotal = welfare.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const donationTotal = offerings
    .filter((item) => (item.type || '').toLowerCase() === 'donation')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const seedTotal = offerings
    .filter((item) => (item.type || '').toLowerCase() === 'seed')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const attendanceCount = attendance.filter((item) => item.attendance_status).length;

  return {
    member: {
      id: member?.id || null,
      full_name: member?.full_name || 'Unknown Member',
      membership_id: member?.membership_id || '—',
      email: member?.email || '—',
      phone_number: member?.phone_number || '—',
    },
    totals: {
      tithe: titheTotal,
      welfare: welfareTotal,
      donation: donationTotal,
      seed: seedTotal,
      attendance: attendanceCount,
      totalGiving: titheTotal + welfareTotal + donationTotal + seedTotal,
    },
    tithes,
    welfare,
    offerings,
    attendance,
  };
};

module.exports = { buildMemberReportSummary };
