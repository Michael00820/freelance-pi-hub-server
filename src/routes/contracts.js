import { Router } from 'express'
import { pool } from '../utils/db.js'
import { authRequired } from '../middleware/auth.js'
import { createPiPayment } from '../utils/piPayment.js'
const router = Router()

router.post('/:id/fund', authRequired, async (req,res)=>{
  try {
    const id = req.params.id
    const c = await pool.query('SELECT * FROM contracts WHERE id=$1', [id])
    if (c.rowCount===0) return res.status(404).json({ ok:false, error:'Contract not found' })
    const contract = c.rows[0]
    if (contract.client_id !== req.user.id) return res.status(403).json({ ok:false, error:'Not your contract' })
    const job = (await pool.query('SELECT * FROM jobs WHERE id=$1', [contract.job_id])).rows[0]
    const amount = Number(job.budget_pi)

    const payment = await pool.query(
      'INSERT INTO payments(contract_id,payer_id,payee_id,amount_pi,status) VALUES($1,$2,$3,$4,$5) RETURNING *',
      [id, req.user.id, contract.freelancer_id, amount, 'pending']
    )

    const payReq = await createPiPayment({
      amount,
      memo: `Escrow for contract ${id}`,
      metadata: { contract_id: id, payment_id: payment.rows[0].id }
    })

    res.json({ ok:true, payment:payment.rows[0], piPaymentRequest: payReq })
  } catch (e) { res.status(400).json({ ok:false, error:e.message }) }
})

router.post('/:id/release', authRequired, async (req,res)=>{
  try {
    const id = req.params.id
    const c = await pool.query('SELECT * FROM contracts WHERE id=$1', [id])
    if (c.rowCount===0) return res.status(404).json({ ok:false, error:'Contract not found' })
    const contract = c.rows[0]
    if (contract.client_id !== req.user.id) return res.status(403).json({ ok:false, error:'Not your contract' })

    const p = await pool.query(
      'SELECT * FROM payments WHERE contract_id=$1 AND status=$2 ORDER BY created_at DESC LIMIT 1',
      [id, 'completed']
    )
    if (p.rowCount===0) return res.status(400).json({ ok:false, error:'No completed escrow payment' })

    const amount = Number(p.rows[0].amount_pi)
    await pool.query('UPDATE contracts SET status=$1 WHERE id=$2', ['released', id])
    await pool.query('UPDATE balances SET available_pi = available_pi + $1, updated_at=NOW() WHERE user_id=$2',
      [amount * 0.9, contract.freelancer_id])

    res.json({ ok:true, released:true, fee_pi: amount*0.1, to_freelancer_pi: amount*0.9 })
  } catch (e) { res.status(400).json({ ok:false, error:e.message }) }
})

export default router