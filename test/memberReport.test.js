const test = require('node:test');
const assert = require('node:assert/strict');

const { buildMemberReportSummary } = require('../src/utils/memberReport');

test('buildMemberReportSummary totals member contribution and attendance correctly', () => {
  const summary = buildMemberReportSummary(
    { full_name: 'Jane Doe', membership_id: 'MEM-001' },
    {
      tithes: [{ amount: 100 }, { amount: 50 }],
      welfare: [{ amount: 30 }],
      offerings: [
        { amount: 40, type: 'Donation' },
        { amount: 15, type: 'Seed' },
        { amount: 20, type: 'Offering' }
      ],
      attendance: [{ attendance_status: true }, { attendance_status: true }, { attendance_status: false }],
    }
  );

  assert.equal(summary.member.full_name, 'Jane Doe');
  assert.equal(summary.totals.tithe, 150);
  assert.equal(summary.totals.welfare, 30);
  assert.equal(summary.totals.donation, 40);
  assert.equal(summary.totals.seed, 15);
  assert.equal(summary.totals.attendance, 2);
  assert.equal(summary.totals.totalGiving, 235);
  assert.equal(summary.totals.offering, undefined);
});
