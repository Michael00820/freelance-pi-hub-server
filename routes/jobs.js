// routes/jobs.js
import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET /api/jobs
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, title, company, location, description, created_at FROM fpi.jobs ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs
router.post("/", async (req, res, next) => {
  try {
    const { title, company, location, description } = req.body;
    if (!title || !company) {
      return res.status(400).json({ error: "title and company are required" });
    }
    const { rows } = await pool.query(
      `INSERT INTO fpi.jobs (title, company, location, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, company, location, description, created_at`,
      [title, company, location ?? null, description ?? null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;