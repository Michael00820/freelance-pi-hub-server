// src/routes/contracts.js
const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const { createPiPayment } = require("../utils/piPayment");

const router = express.Router();

// Create a contract when client accepts freelancer proposal
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { proposal_id } = req.body;
    const userId = req.user.id;

    const proposal = await pool.query(
      "SELECT * FROM proposals WHERE id=$1",
      [proposal_id]
    );
    if (proposal.rows.length === 0) {
      return res.status(404).json({ error: "Proposal not found" });
    }
    const job = await pool.query("SELECT * FROM jobs WHERE id=$1", [
      proposal.rows[0].job_id,
    ]);
    if (job.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.rows[0].client_id !== userId) {
      return res
        .status(403)
        .json({ error: "Only the job owner can create a contract" });
    }

    const contract = await pool.query(
      "INSERT INTO contracts (job_id, freelancer_id, client_id, proposal_id) VALUES ($1,$2,$3,$4) RETURNING *",
      [
        job.rows[0].id,
        proposal.rows[0].freelancer_id,
        userId,
        proposal_id,
      ]
    );

    res.json({ ok: true, contract: contract.rows[0] });
  } catch (err) {
    console.error("Error creating contract:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Fund escrow
router.post("/:id/fund", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const contract = await pool.query(
      "SELECT * FROM contracts WHERE id=$1",
      [id]
    );
    if (contract.rows.length === 0) {
      return res.status(404).json({ error: "Contract not found" });
    }
    if (contract.rows[0].client_id !== userId) {
      return res
        .status(403)
        .json({ error: "Only the client can fund escrow" });
    }

    const job = await pool.query("SELECT * FROM jobs WHERE id=$1", [
      contract.rows[0].job_id,
    ]);
    const amount = job.rows[0].budget;

    // Add client fee (default 3%)
    const clientFeePct = Number(process.env.CLIENT_FEE_PERCENT || 3);
    const clientFeePi = Number((amount * clientFeePct / 100).toFixed(8));
    const totalClientPayPi = Number((amount + clientFeePi).toFixed(8));

    // Create Pi payment for escrow funding
    const payReq = await createPiPayment({
      amount: totalClientPayPi,
      memo: `Fund escrow for contract ${id}`,
      metadata: { contractId: id, type: "escrow_funding" },
    });

    const payment = await pool.query(
      "INSERT INTO escrow_payments (contract_id, amount, client_id, status, pi_payment_id) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [id, amount, userId, "pending", payReq.identifier]
    );

    res.json({
      ok: true,
      payment: payment.rows[0],
      piPaymentRequest: payReq,
      breakdown: {
        budget_pi: amount,
        client_fee_pct: clientFeePct,
        client_fee_pi: clientFeePi,
        total_to_pay_pi: totalClientPayPi,
      },
    });
  } catch (err) {
    console.error("Error funding escrow:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Release funds to freelancer
router.post("/:id/release", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const contractRes = await pool.query(
      "SELECT * FROM contracts WHERE id=$1",
      [id]
    );
    if (contractRes.rows.length === 0) {
      return res.status(404).json({ error: "Contract not found" });
    }
    const contract = contractRes.rows[0];

    if (contract.client_id !== userId) {
      return res
        .status(403)
        .json({ error: "Only the client can release escrow" });
    }

    const escrow = await pool.query(
      "SELECT * FROM escrow_payments WHERE contract_id=$1 AND status='pending'",
      [id]
    );
    if (escrow.rows.length === 0) {
      return res.status(400).json({ error: "No funded escrow found" });
    }
    const amount = escrow.rows[0].amount;

    // Apply platform fee (default 5%)
    const platformFeePct = Number(process.env.PLATFORM_FEE_PERCENT || 5);
    const platformFeePi = Number((amount * platformFeePct / 100).toFixed(8));
    const freelancerTakeHomePi = Number(
      (amount - platformFeePi).toFixed(8)
    );

    // Mark escrow as completed
    await pool.query(
      "UPDATE escrow_payments SET status='completed', released_at=NOW() WHERE id=$1",
      [escrow.rows[0].id]
    );

    // Update freelancer balance
    await pool.query(
      "UPDATE balances SET available_pi = available_pi + $1, updated_at=NOW() WHERE user_id=$2",
      [freelancerTakeHomePi, contract.freelancer_id]
    );

    res.json({
      ok: true,
      released: true,
      fee_pi: platformFeePi,
      to_freelancer_pi: freelancerTakeHomePi,
      platform_fee_pct: platformFeePct,
      escrow_amount_pi: amount,
    });
  } catch (err) {
    console.error("Error releasing escrow:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;