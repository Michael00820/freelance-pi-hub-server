// index.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import sequelize from "./db.js";
import authRoutes from "./routes/auth.js";
import jobsRouter from "./routes/jobs.js"; // keep if you already have this

const sequelize = require('./models/index');
const User = require('./models/User');
const Job = require('./models/Job');

// Test & sync DB
sequelize.sync({ alter: true })  // alter updates schema without wiping data
  .then(() => console.log("✅ Database synced"))
  .catch(err => console.error("❌ Database sync error:", err));
dotenv.config();

const app = express();

// CORS — allow your Vercel client
const corsOrigin = process.env.FRONTEND_ORIGIN || "*";
app.use(
  cors({
    origin: corsOrigin,
    credentials: false,
  })
);

app.use(helmet());
app.use(express.json());

// health + root
app.get("/", (_req, res) => res.json({ ok: true, service: "freelance-pi-hub-server" }));
app.get("/api/health", (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

// auth
app.use("/api/auth", authRoutes);

// jobs (if you have it)
if (jobsRouter) app.use("/api/jobs", jobsRouter);

// start (Render sets PORT)
const PORT = process.env.PORT || 8080;

// Sync models then listen
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // creates tables if not present
    app.listen(PORT, () => console.log(`API listening on ${PORT}`));
  } catch (err) {
    console.error("DB_INIT_ERROR", err);
    process.exit(1);
  }
})();