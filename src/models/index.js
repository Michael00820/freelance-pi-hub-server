import { Sequelize } from 'sequelize';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/freelance_pi_hub';
export const sequelize = new Sequelize(DATABASE_URL, { dialect: 'postgres', logging: false });

export { User } from './User.js';
export { Payment } from './Payment.js';