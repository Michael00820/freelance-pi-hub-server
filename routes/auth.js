// routes/auth.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import pool from "../db.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

// helper: make JWT
function signToken(payload) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET not set");
  // token valid for 7 days
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// middleware: require Bearer token
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const [, token] = auth.split(" ");
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
router.post(
  "/register",
  body("name").trim().isLength({ min: 2 }).withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be 6+ chars"),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;

      // check if user exists
      const existing = await pool.query(
        "SELECT id FROM fpi.users WHERE email = $1",
        [email]
      );
      if (existing.rowCount > 0) {
        return res.status(409).json({ error: "Email already in use" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const { rows } = await pool.query(
        `INSERT INTO fpi.users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email, created_at`,
        [name, email, passwordHash]
      );

      const user = rows[0];
      const token = signToken({ id: user.id, email: user.email });

      res.status(201).json({ user, token });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post(
  "/login",
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const { rows } = await pool.query(
        "SELECT id, name, email, password_hash FROM fpi.users WHERE email = $1",
        [email]
      );
      if (rows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = rows[0];
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = signToken({ id: user.id, email: user.email });

      // remove password_hash from the response
      delete user.password_hash;

      res.json({ user, token });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 */
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, created_at FROM fpi.users WHERE id = $1",
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;