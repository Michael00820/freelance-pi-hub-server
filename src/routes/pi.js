import { Router } from 'express'
import crypto from 'crypto'
import { pool } from '../utils/db.js'
const router = Router()

router.post('/webhook', async (req,res)=>{
  try {
    const secret = process.env.WEBHOOK_SECRET || ''
    const sig = req.headers['x-webhook-sign']
    if (secret && sig) {
      const calc = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex')
      if (calc !== sig) return res.status(401).json({ ok:false, error:'Bad signature' })
    }
    const payload = req.body
    if (!payload?.metadata?.payment_id) return res.status(400).json({ ok:false, error:'Missing metadata' })

    if (payload.status === 'completed') {
      await pool.query('UPDATE payments SET status=$1, pi_tx_id=$2, meta=$3 WHERE id=$4',
        ['completed', payload.tx_id || null, payload, payload.metadata.payment_id])
      await pool.query('UPDATE contracts SET status=$1, escrow_payment_id=$2 WHERE id=$3',
        ['funded', payload.metadata.payment_id, payload.metadata.contract_id])
    } else if (payload.status === 'cancelled') {
      await pool.query('UPDATE payments SET status=$1, meta=$2 WHERE id=$3',
        ['cancelled', payload, payload.metadata.payment_id])
    }
    res.json({ ok:true })
  } catch (e) { res.status(400).json({ ok:false, error:e.message }) }
})

export default router