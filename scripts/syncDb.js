const sequelize = require('../src/config/db');

require('../src/models/User');
require('../src/models/Member');
require('../src/models/Tithe');
require('../src/models/Attendance');
require('../src/models/WelfareContribution');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    await sequelize.sync({ alter: true });
    console.log('All tables created/updated');

    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log('Tables:', tables.map(t => t.table_name).join(', '));

    process.exit(0);
  } catch (err) {
    console.error('Sync failed:', err);
    process.exit(1);
  }
})();
