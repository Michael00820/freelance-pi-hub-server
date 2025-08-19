// Minimal Express API with mock auth + in-memory jobs
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// ---- Seed / in-memory store ----
const jobs = [
  {
    id: 'j1',
    title: 'Landing page (3 sections)',
    description: 'Simple responsive landing page in React/Vite.',
    budget: 120,
    currency: 'PI',
    platformFeePct: 5,
    clientFeePct: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'j2',
    title: 'Bug fix: React form validation',
    description: 'Fix form validation + unit test.',
    budget: 60,
    currency: 'PI',
    platformFeePct: 5,
    clientFeePct: 3,
    createdAt: new Date().toISOString(),
  },
];

// ---- Mock auth ----
const DEMO_TOKEN = 'demo-token';

app.post('/auth/register', (req, res) => {
  const { email, name, role } = req.body || {};
  return res.json({ ok: true, token: DEMO_TOKEN, user: { email, name, role } });
});

app.post('/auth/login', (req, res) => {
  const { email } = req.body || {};
  return res.json({ ok: true, token: DEMO_TOKEN, user: { email, name: 'Demo User' } });
});

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  if (token === DEMO_TOKEN) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// ---- Jobs ----
app.get('/jobs', (_req, res) => res.json(jobs));

app.post('/jobs', requireAuth, (req, res) => {
  const { title, description, budget, currency = 'PI' } = req.body || {};
  if (!title || !description || budget == null) {
    return res.status(400).json({ error: 'title, description, budget required' });
  }
  const platformFeePct = 5;
  const clientFeePct = 3;

  const job = {
    id: 'j' + (jobs.length + 1),
    title,
    description,
    budget: Number(budget),
    currency,
    platformFeePct,
    clientFeePct,
    createdAt: new Date().toISOString(),
  };
  jobs.push(job);
  return res.status(201).json(job);
});

// Health
app.get('/', (_req, res) => res.send('Freelance Pi Hub Backend Running...'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('API listening on', PORT));