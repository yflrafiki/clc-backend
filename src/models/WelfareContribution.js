const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const WelfareContribution = sequelize.define('WelfareContribution', {

  member_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  purpose: {
    type: DataTypes.STRING
  },

  date_paid: {
    type: DataTypes.DATEONLY
  }

}, {
  tableName: 'welfare_contributions',
  timestamps: false
});

module.exports = WelfareContribution;
