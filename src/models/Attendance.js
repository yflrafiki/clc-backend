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

  attendance_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }

}, {
  tableName: 'attendance',
  timestamps: false
});

module.exports = Attendance;
