const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BankReceipt = sequelize.define('BankReceipt', {

  category: {
    type: DataTypes.ENUM('Tithe', 'Welfare', 'Offering', 'Donation', 'Seed'),
    allowNull: false
  },

  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  receipt_image: {
    type: DataTypes.STRING,
    allowNull: false
  },

  bank_name: {
    type: DataTypes.STRING
  },

  transaction_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  notes: {
    type: DataTypes.TEXT
  },

  uploaded_by: {
    type: DataTypes.INTEGER
  }

}, {
  tableName: 'bank_receipts',
  timestamps: true
});

module.exports = BankReceipt;
