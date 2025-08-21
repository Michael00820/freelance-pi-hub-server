// models/index.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import createUser from "./User.js";
import createJob from "./Job.js";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";

let sequelize;

// Prefer a single DATABASE_URL (Render/Postgres). Fall back to discrete vars.
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: isProd
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
  });
} else {
  const {
    DB_HOST = "localhost",
    DB_PORT = "5432",
    DB_NAME = "freelance_pi_hub",
    DB_USER = "postgres",
    DB_PASSWORD = "",
  } = process.env;

  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: "postgres",
    logging: false,
  });
}

// Initialize models
const User = createUser(sequelize);
const Job = createJob(sequelize);

// Associations
User.hasMany(Job, { foreignKey: "userId", onDelete: "CASCADE" });
Job.belongsTo(User, { foreignKey: "userId" });

export { User, Job };
export default sequelize;