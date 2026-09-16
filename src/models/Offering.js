const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Offering = sequelize.define('Offering', {

  type: {
    type: DataTypes.ENUM('Offering', 'Donation', 'Seed'),
    allowNull: false,
    defaultValue: 'Offering'
  },

  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  payment_method: {
    type: DataTypes.STRING,
    defaultValue: 'Cash'
  },

  date_collected: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  notes: {
    type: DataTypes.TEXT
  },

  recorded_by: {
    type: DataTypes.INTEGER
  }

}, {
  tableName: 'offerings',
  timestamps: false
});

module.exports = Offering;
