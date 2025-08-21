// db.js
import { Sequelize } from "sequelize";

const databaseUrl = process.env.DATABASE_URL;

const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

export default sequelize;
