// Adds the QR check-in columns and visitor table. Additive only and safe to re-run,
// unlike db:sync (alter: true), which can drop columns on other tables.
const sequelize = require('../src/config/db');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    await sequelize.query(`
      ALTER TABLE attendance
        ADD COLUMN IF NOT EXISTS service VARCHAR(255),
        ADD COLUMN IF NOT EXISTS check_in_method VARCHAR(255) DEFAULT 'front_desk',
        ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ DEFAULT NOW()
    `);
    console.log('attendance: service, check_in_method, checked_in_at');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS visitor_attendance (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(255),
        first_time BOOLEAN DEFAULT false,
        service VARCHAR(255),
        service_date DATE NOT NULL,
        checked_in_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('visitor_attendance table ready');

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();
