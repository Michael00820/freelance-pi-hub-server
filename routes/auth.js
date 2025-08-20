// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// helpers
const signToken = (user) =>
  jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, message: "Missing fields" });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ ok: false, message: "Email in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      role: role === "Client" ? "Client" : "Freelancer",
      passwordHash,
    });

    const token = signToken(user);
    res.status(201).json({
      ok: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("REGISTER_ERROR", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: "Missing fields" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ ok: false, message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ ok: false, message: "Invalid credentials" });

    const token = signToken(user);
    res.json({
      ok: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("LOGIN_ERROR", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

export default router;