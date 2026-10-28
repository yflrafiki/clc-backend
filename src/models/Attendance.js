const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Attendance = sequelize.define('Attendance', {

  member_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  service_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  service: {
    type: DataTypes.STRING
  },

  // 'qr' when the member scanned and checked themselves in, 'front_desk' when staff marked them
  check_in_method: {
    type: DataTypes.STRING,
    defaultValue: 'front_desk'
  },

  checked_in_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  attendance_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }

}, {
  tableName: 'attendance',
  timestamps: false
});

module.exports = Attendance;
