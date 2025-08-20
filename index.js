// index.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import jobsRouter from "./routes/jobs.js";
import authRouter from "./routes/auth.js"; // <— new

dotenv.config();

const app = express();

// CORS (allow your Vercel frontend)
const corsOrigin = process.env.FRONTEND_ORIGIN || "*";
app.use(
  cors({
    origin: corsOrigin,
    credentials: false,
  })
);

// Security headers
app.use(helmet());

// Parse JSON
app.use(express.json());

// Health + root
app.get("/", (req, res) => {
  res.json({ ok: true, service: "freelance-pi-hub-server" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/jobs", jobsRouter);
app.use("/api/auth", authRouter); // <— new

// Error handler (last)
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Server error" });
});

// Start (Render will set PORT)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});