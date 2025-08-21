// index.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import sequelize from "./models/index.js";   // Sequelize instance
import authRoutes from "./routes/auth.js";
import jobsRouter from "./routes/jobs.js";

dotenv.config();

const app = express();

// CORS – allow your frontend
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
app.get("/", (_req, res) =>
  res.json({ ok: true, service: "freelance-pi-hub-server" })
);
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, status: "healthy" })
);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRouter);

// Sequelize sync
sequelize
  .sync({ alter: true }) // alter = safe schema update
  .then(() => {
    console.log("✅ Database synced");

    const PORT = process.env.PORT || 10000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ Database sync error:", err);
    process.exit(1); // crash if DB fails
  });

// Global error logging
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
});