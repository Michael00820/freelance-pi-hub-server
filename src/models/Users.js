import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

export const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  pi_uid: { type: DataTypes.STRING, unique: true, allowNull: false },
  username: { type: DataTypes.STRING, allowNull: true },
}, { tableName: 'users', timestamps: true });