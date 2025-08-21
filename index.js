// index.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { sequelize } from "./models/index.js";
import piRoutes from "./routes/pi.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 10000);
const corsOrigin = process.env.FRONTEND_ORIGIN || "*";

app.use(
  cors({
    origin: corsOrigin,
    credentials: false
  })
);
app.use(helmet());
app.use(express.json());

// health + root
app.get("/", (_req, res) => {
  res.json({ ok: true, service: "freelance-pi-hub-server" });
});

app.use("/api/pi", piRoutes);

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log("==> Your service is live");
    });
  } catch (err) {
    console.error("DB error:", err);
    process.exit(1);
  }
}

start();
