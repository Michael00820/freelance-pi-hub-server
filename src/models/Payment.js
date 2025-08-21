import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

export const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  payment_id: { type: DataTypes.STRING, unique: true, allowNull: false },
  pi_uid: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DECIMAL(18,8), allowNull: false },
  status: { type: DataTypes.ENUM('CREATED','APPROVED','COMPLETED','FAILED'), allowNull: false, defaultValue: 'CREATED' },
  memo: { type: DataTypes.STRING },
  metadata: { type: DataTypes.TEXT },
}, { tableName: 'payments', timestamps: true });