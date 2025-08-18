import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export function authRequired(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ ok:false, error:'Missing token' })
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next() }
  catch { res.status(401).json({ ok:false, error:'Invalid token' }) }
}

export function signToken(user) {
  const payload = { id:user.id, email:user.email, role:user.role, name:user.name }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn:'7d' })
}