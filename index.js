import express from "express";
import cors from "cors";
import helmet from "helmet";
import jobsRouter from "./routes/jobs.js";

const app = express();

// CORS (allow your Vercel frontend)
const corsOrigin =
  process.env.FRONTEND_ORIGIN ||
  "https://freelance-pi-hub-client.vercel.app";

app.use(
  cors({
    origin: corsOrigin,
    credentials: false,
  })
);

// Security headers
app.use(helmet());

// Body parser
app.use(express.json());

// Health check (Render pings this)
app.get("/healthz", (req, res) => {
  res.json({ ok: true, message: "Server is running" });
});

// API routes
app.use("/api/jobs", jobsRouter);

// Root
app.get("/", (req, res) => {
  res.send("Freelance Pi Hub Backend running 🚀");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});// index.js
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
