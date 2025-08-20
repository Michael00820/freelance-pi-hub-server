// index.js (root of project)
import express from "express";
import cors from "cors";

const app = express();

// Allow your Vercel site to call the API
const corsOrigin = process.env.FRONTEND_ORIGIN || "*";
app.use(
  cors({
    origin: corsOrigin,
    credentials: false,
  })
);

app.use(express.json());

// Basic health check (Render pings this if you set Health Check Path to /healthz)
app.get("/healthz", (req, res) => {
  res.json({ ok: true, message: "Server is running" });
});

// Simple root
app.get("/", (_req, res) => {
  res.type("text/plain").send("Freelance Pi Hub Backend Running...");
});

// In-memory jobs (so the frontend has something to show)
const jobs = [
  {
    id: "j1",
    title: "Landing page (3 sections)",
    description: "Simple responsive landing page in React/Vite.",
    budget: 120,
    currency: "PI",
    platformFeePct: 5,
    clientFeePct: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: "j2",
    title: "Bug fix: React form validation",
    description: "Fix form validation + unit test.",
    budget: 60,
    currency: "PI",
    platformFeePct: 5,
    clientFeePct: 3,
    createdAt: new Date().toISOString(),
  },
];

app.get("/api/jobs", (_req, res) => {
  res.json({ jobs });
});

// Start server (Render injects PORT)
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on ${PORT}`);
});