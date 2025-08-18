import { Router } from 'express'
import { z } from 'zod'
import { pool } from '../utils/db.js'
import { authRequired } from '../middleware/auth.js'
const router = Router()

const ProposalSchema = z.object({
  cover_letter: z.string().min(10),
  bid_pi: z.number().positive()
})

router.post('/:jobId', authRequired, async (req,res)=>{
  try {
    if (req.user.role !== 'freelancer') return res.status(403).json({ ok:false, error:'Only freelancers can bid' })
    const data = ProposalSchema.parse(req.body)
    const jobId = req.params.jobId
    const r = await pool.query(
      'INSERT INTO proposals(job_id,freelancer_id,cover_letter,bid_pi) VALUES($1,$2,$3,$4) RETURNING *',
      [jobId, req.user.id, data.cover_letter, data.bid_pi]
    )
    res.json({ ok:true, proposal:r.rows[0] })
  } catch (e) { res.status(400).json({ ok:false, error:e.message }) }
})

router.get('/by-job/:jobId', authRequired, async (req,res)=>{
  const r = await pool.query(
    'SELECT p.*, u.name as freelancer_name FROM proposals p JOIN users u ON u.id=p.freelancer_id WHERE p.job_id=$1 ORDER BY p.created_at DESC',
    [req.params.jobId]
  )
  res.json({ ok:true, proposals:r.rows })
})

router.post('/accept/:proposalId', authRequired, async (req,res)=>{
  try {
    const pid = req.params.proposalId
    const prop = await pool.query('SELECT * FROM proposals WHERE id=$1', [pid])
    if (prop.rowCount===0) return res.status(404).json({ ok:false, error:'Proposal not found' })
    const job = (await pool.query('SELECT * FROM jobs WHERE id=$1', [prop.rows[0].job_id])).rows[0]
    if (job.client_id !== req.user.id) return res.status(403).json({ ok:false, error:'Not your job' })

    await pool.query('UPDATE proposals SET status=$1 WHERE job_id=$2', ['rejected', job.id])
    const acc = await pool.query('UPDATE proposals SET status=$1 WHERE id=$2 RETURNING *', ['accepted', pid])

    const c = await pool.query(
      'INSERT INTO contracts(job_id,client_id,freelancer_id,status) VALUES($1,$2,$3,$4) RETURNING *',
      [job.id, req.user.id, acc.rows[0].freelancer_id, 'awaiting_funding']
    )
    await pool.query('UPDATE jobs SET status=$1 WHERE id=$2', ['in_progress', job.id])
    res.json({ ok:true, contract:c.rows[0] })
  } catch (e) { res.status(400).json({ ok:false, error:e.message }) }
})

export default router