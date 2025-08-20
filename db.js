// db.js
import { Sequelize } from "sequelize";

const {
  DATABASE_URL,
  PGHOST,
  PGUSER,
  PGPASSWORD,
  PGDATABASE,
  PGPORT,
  NODE_ENV,
} = process.env;

let sequelize;

if (DATABASE_URL) {
  // Single URL (Render recommended)
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  });
} else {
  // Individual env vars
  sequelize = new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
    host: PGHOST || "localhost",
    port: PGPORT ? Number(PGPORT) : 5432,
    dialect: "postgres",
    dialectOptions:
      NODE_ENV === "production"
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
    logging: false,
  });
}

export default sequelize;