const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Tithe = sequelize.define('Tithe', {

  member_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  payment_method: {
    type: DataTypes.STRING
  },

  date_paid: {
    type: DataTypes.DATEONLY
  },

  notes: {
    type: DataTypes.TEXT
  },

  recorded_by: {
    type: DataTypes.INTEGER
  }

}, {
  tableName: 'tithes',
  timestamps: false
});

module.exports = Tithe;
