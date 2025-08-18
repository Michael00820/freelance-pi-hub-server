import { Router } from 'express'
import { z } from 'zod'
import { pool } from '../utils/db.js'
import { authRequired } from '../middleware/auth.js'
const router = Router()

const JobSchema = z.object({
  title: z.string().min(4),
  description: z.string().min(10),
  budget_pi: z.number().positive()
})

router.post('/', authRequired, async (req,res)=>{
  try {
    if (req.user.role !== 'client') return res.status(403).json({ ok:false, error:'Only clients can post jobs' })
    const data = JobSchema.parse(req.body)
    const r = await pool.query(
      'INSERT INTO jobs(client_id,title,description,budget_pi) VALUES($1,$2,$3,$4) RETURNING *',
      [req.user.id, data.title, data.description, data.budget_pi]
    )
    res.json({ ok:true, job:r.rows[0] })
  } catch (e) { res.status(400).json({ ok:false, error:e.message }) }
})

router.get('/', async (_req,res)=>{
  const r = await pool.query(
    'SELECT j.*, u.name as client_name FROM jobs j JOIN users u ON u.id=j.client_id WHERE status=$1 ORDER BY created_at DESC',
    ['open']
  )
  res.json({ ok:true, jobs:r.rows })
})

router.get('/:id', async (req,res)=>{
  const r = await pool.query(
    'SELECT j.*, u.name as client_name FROM jobs j JOIN users u ON u.id=j.client_id WHERE j.id=$1',
    [req.params.id]
  )
  if (r.rowCount===0) return res.status(404).json({ ok:false, error:'Job not found' })
  res.json({ ok:true, job:r.rows[0] })
})

export default router