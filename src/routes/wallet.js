import { Router } from 'express'
import { authRequired } from '../middleware/auth.js'
import { pool } from '../utils/db.js'
const router = Router()

router.get('/balance', authRequired, async (req,res)=>{
  const r = await pool.query('SELECT * FROM balances WHERE user_id=$1', [req.user.id])
  res.json({ ok:true, balance:r.rows[0] })
})

export default router