const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {

  full_name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }

}, {
  tableName: 'users',
  timestamps: false
});

module.exports = User;