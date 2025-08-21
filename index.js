// index.js (ESM)
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// ---- Sequelize connection ----
import sequelize from './db.js';          // your Sequelize instance (exports new Sequelize(...))

// ---- Routers (keep these if you have them) ----
import authRoutes from './routes/auth.js';
import jobsRouter from './routes/jobs.js';

// ----- App setup -----
const app = express();

// Allow your Vercel frontend in prod; allow all in dev if none provided
const corsOrigin =
  process.env.FRONTEND_ORIGIN ||
  process.env.VERCEL_URL?.startsWith('http')
    ? process.env.VERCEL_URL
    : '*';

app.use(
  cors({
    origin: corsOrigin,
    credentials: false,
  })
);
app.use(helmet());
app.use(express.json());

// Health & root
app.get('/', (_req, res) =>
  res.json({ ok: true, service: 'freelance-pi-hub-server' })
);
app.get('/api/health', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ ok: true, db: 'up' });
  } catch (e) {
    res.status(500).json({ ok: false, db: 'down', error: e?.message });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRouter);

// ---- Start server after DB sync ----
const PORT = Number(process.env.PORT || 10000);

async function start() {
  try {
    // adjust sync options as you prefer:
    await sequelize.sync(); // or { alter: true } during development
    console.log('✅ Database synced');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();

// Guard against unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION', reason);
});