import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { pool } from '../utils/db.js'
import { signToken, authRequired } from '../middleware/auth.js'
const router = Router()

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['client','freelancer']),
  pi_username: z.string().optional()
})

router.post('/register', async (req,res)=>{
  try {
    const data = RegisterSchema.parse(req.body)
    const hash = await bcrypt.hash(data.password, 10)
    const q = `INSERT INTO users(email,password_hash,name,role,pi_username)
               VALUES($1,$2,$3,$4,$5)
               RETURNING id,email,name,role,pi_username`
    const vals = [data.email, hash, data.name, data.role, data.pi_username || null]
    const r = await pool.query(q, vals)
    const token = signToken(r.rows[0])
    res.json({ ok:true, user:r.rows[0], token })
  } catch (e) { res.status(400).json({ ok:false, error:e.message }) }
})

const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(6) })

router.post('/login', async (req,res)=>{
  try {
    const { email, password } = LoginSchema.parse(req.body)
    const r = await pool.query('SELECT * FROM users WHERE email=$1', [email])
    if (r.rowCount === 0) return res.status(400).json({ ok:false, error:'Invalid credentials' })
    const user = r.rows[0]
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(400).json({ ok:false, error:'Invalid credentials' })
    const safe = { id:user.id, email:user.email, name:user.name, role:user.role, pi_username:user.pi_username }
    const token = signToken(safe)
    res.json({ ok:true, user:safe, token })
  } catch (e) { res.status(400).json({ ok:false, error:e.message }) }
})

router.get('/me', authRequired, async (req,res)=>{
  const r = await pool.query('SELECT id,email,name,role,pi_username FROM users WHERE id=$1', [req.user.id])
  res.json({ ok:true, user:r.rows[0] })
})

router.put('/me', authRequired, async (req,res)=>{
  const { name, pi_username } = req.body
  const r = await pool.query(
    'UPDATE users SET name=$1, pi_username=$2 WHERE id=$3 RETURNING id,email,name,role,pi_username',
    [name, pi_username, req.user.id]
  )
  res.json({ ok:true, user:r.rows[0] })
})

export default router