const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// One row per visitor check-in (people who are not yet registered members)
const Visitor = sequelize.define('Visitor', {

  full_name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  phone_number: {
    type: DataTypes.STRING
  },

  first_time: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  service: {
    type: DataTypes.STRING
  },

  service_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  checked_in_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: 'visitor_attendance',
  timestamps: false
});

module.exports = Visitor;
