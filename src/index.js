import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { pool } from './utils/db.js'
import authRoutes from './routes/auth.js'
import jobRoutes from './routes/jobs.js'
import proposalRoutes from './routes/proposals.js'
import contractRoutes from './routes/contracts.js'
import walletRoutes from './routes/wallet.js'
import piRoutes from './routes/pi.js'

dotenv.config()
const app = express()

app.use(helmet())
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

app.get('/api/health', async (_req,res)=>{
  try { const r = await pool.query('SELECT 1'); res.json({ ok:true, db:r.rows[0] }) }
  catch (e) { res.status(500).json({ ok:false, error:e.message }) }
})

app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/proposals', proposalRoutes)
app.use('/api/contracts', contractRoutes)
app.use('/api/wallet', walletRoutes)
app.use('/api/pi', piRoutes)

const PORT = process.env.PORT || 4000
app.listen(PORT, ()=> console.log(`Server listening on :${PORT}`))