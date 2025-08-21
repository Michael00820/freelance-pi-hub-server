import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { sequelize } from './models/index.js';
import { piRouter } from './routes/pi.js';

const app = express();
const PORT = process.env.PORT || 10000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, env: process.env.PI_ENV || 'sandbox' });
});

app.use('/api/pi', piRouter);

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // dev only; use migrations in prod
    app.listen(PORT, () => console.log(`✅ Backend on http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start:', err);
    process.exit(1);
  }
})();