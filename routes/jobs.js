// routes/jobs.js
import express from "express";
import { query } from "../db.js";

const router = express.Router();

/**
 * GET /api/jobs
 * Returns the latest jobs from Postgres (schema: fpi)
 */
router.get("/", async (_req, res) => {
  try {
    const sql = `
      SELECT
        id,
        title,
        description,
        budget,
        currency,
        platform_fee_pct AS "platformFeePct",
        client_fee_pct   AS "clientFeePct",
        created_at       AS "createdAt"
      FROM fpi.jobs
      ORDER BY created_at DESC
      LIMIT 100;
    `;
    const { rows } = await query(sql);
    res.json({ ok: true, jobs: rows });
  } catch (err) {
    console.error("GET /api/jobs error:", err);
    res.status(500).json({ ok: false, error: "Failed to load jobs." });
  }
});

/**
 * POST /api/jobs
 * Body: { title, description, budget, currency, platformFeePct, clientFeePct }
 * Inserts a new job row and returns it.
 */
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      budget,
      currency = "PI",
      platformFeePct = 5,
      clientFeePct = 3,
    } = req.body || {};

    // Basic validation
    if (!title || !description || budget == null) {
      return res.status(400).json({
        ok: false,
        error: "title, description and budget are required",
      });
    }

    const sql = `
      INSERT INTO fpi.jobs (
        title, description, budget, currency, platform_fee_pct, client_fee_pct
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        title,
        description,
        budget,
        currency,
        platform_fee_pct AS "platformFeePct",
        client_fee_pct   AS "clientFeePct",
        created_at       AS "createdAt";
    `;
    const params = [
      title,
      description,
      Number(budget),
      currency,
      Number(platformFeePct),
      Number(clientFeePct),
    ];

    const { rows } = await query(sql, params);
    res.status(201).json({ ok: true, job: rows[0] });
  } catch (err) {
    console.error("POST /api/jobs error:", err);
    res.status(500).json({ ok: false, error: "Failed to create job." });
  }
});

export default router;