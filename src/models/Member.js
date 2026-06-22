const { DataTypes } = require('sequelize');

const sequelize = require('../config/db');

const Member = sequelize.define('Member', {

  membership_id: {
    type: DataTypes.STRING,
    unique: true
  },

  full_name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  gender: {
    type: DataTypes.STRING
  },

  date_of_birth: {
    type: DataTypes.DATE
  },

  phone_number: {
    type: DataTypes.STRING
  },

  address: {
    type: DataTypes.TEXT
  },

  date_joined: {
    type: DataTypes.DATE
  },

  emergency_contact: {
    type: DataTypes.STRING
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: 'Active'
  }

}, {
  tableName: 'members',
  timestamps: false
});

module.exports = Member;