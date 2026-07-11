const sequelize = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {

    const [[members]] = await sequelize.query(`
      SELECT COUNT(*)::int AS total
      FROM members
    `);

    const [[attendance]] = await sequelize.query(`
      SELECT COUNT(*)::int AS total
      FROM attendance
      WHERE service_date >= CURRENT_DATE - INTERVAL '7 days'
    `);

    const [[tithes]] = await sequelize.query(`
      SELECT COALESCE(SUM(amount), 0)::float AS total
      FROM tithes
    `);

    const [[welfare]] = await sequelize.query(`
      SELECT COALESCE(SUM(amount), 0)::float AS total
      FROM welfare_contributions
    `);

    const [monthly] = await sequelize.query(`
      SELECT
        TO_CHAR(months.month, 'Mon') AS name,
        COALESCE(t.total, 0)::float AS "Tithes",
        COALESCE(w.total, 0)::float AS "Welfare"
      FROM generate_series(
        date_trunc('month', CURRENT_DATE) - INTERVAL '5 months',
        date_trunc('month', CURRENT_DATE),
        '1 month'
      ) AS months(month)
      LEFT JOIN (
        SELECT date_trunc('month', date_paid) AS month, SUM(amount) AS total
        FROM tithes
        GROUP BY 1
      ) t ON t.month = months.month
      LEFT JOIN (
        SELECT date_trunc('month', date_paid) AS month, SUM(amount) AS total
        FROM welfare_contributions
        GROUP BY 1
      ) w ON w.month = months.month
      ORDER BY months.month
    `);

    res.json({
      total_members: members.total,
      weekly_attendance: attendance.total,
      total_tithes: tithes.total,
      total_welfare: welfare.total,
      monthly
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: 'Failed to fetch dashboard stats'
    });

  }
};

module.exports = {
  getDashboardStats
};
