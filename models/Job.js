const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const User = require('./User');

const Job = sequelize.define('Job', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  budget: { type: DataTypes.FLOAT, allowNull: false },
}, {
  timestamps: true
});

Job.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Job, { foreignKey: 'userId' });

module.exports = Job;