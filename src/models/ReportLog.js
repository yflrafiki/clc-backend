const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ReportLog = sequelize.define('ReportLog', {

  title: {
    type: DataTypes.STRING,
    allowNull: false
  },

  category: {
    type: DataTypes.ENUM('Tithe', 'Welfare', 'Offering', 'Attendance', 'General'),
    allowNull: false,
    defaultValue: 'General'
  },

  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  report_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  submitted_by: {
    type: DataTypes.INTEGER
  }

}, {
  tableName: 'report_logs',
  timestamps: true
});

module.exports = ReportLog;
