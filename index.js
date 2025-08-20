// index.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import jobsRouter from "./routes/jobs.js";

const app = express();

// CORS (allow your Vercel frontend)
const corsOrigin = process.env.FRONTEND_ORIGIN || "*";
app.use(
  cors({
    origin: corsOrigin,
    credentials: false,
  })
);

app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// Healthcheck
app.get("/", (_req, res) => {
  res.json({ ok: true, message: "Server is running" });
});

// Jobs API (now backed by Postgres)
app.use("/api/jobs", jobsRouter);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ ok: false, error: "Not found" });
});

// Start
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Freelance Pi Hub Backend listening on :${PORT}`);
});