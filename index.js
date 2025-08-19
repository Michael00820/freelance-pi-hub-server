// index.js (root of your backend project)
import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());

// allow frontend to call backend
app.use(
  cors({
    origin: [
      "https://freelance-pi-hub-client.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

// health check
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// temporary mock jobs endpoint (for testing without database)
app.get("/api/jobs", (_req, res) => {
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
  res.json(jobs);
});

// simple home page
app.get("/", (_req, res) => {
  res.type("text").send("Freelance Pi Hub Backend Running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});