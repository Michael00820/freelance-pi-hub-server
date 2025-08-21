// routes/pi.js
import express from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import { sequelize, User, Payment } from "../models/index.js";

const router = express.Router();
const PI_API_BASE = "https://api.minepi.com/v2";

function piAxios() {
  return axios.create({
    baseURL: PI_API_BASE,
    headers: { Authorization: `Key ${process.env.PI_API_KEY}` },
    timeout: 15000
  });
}

// POST /api/pi/login { uid, username, accessToken }
router.post("/login", async (req, res) => {
  try {
    const { uid, username, accessToken } = req.body;
    if (!uid || !username || !accessToken) {
      return res.status(400).json({ ok: false, message: "Missing fields" });
    }

    // Verify the access token with Pi
    const { data: me } = await piAxios().get("/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (me.uid !== uid) {
      return res.status(401).json({ ok: false, message: "Invalid Pi token" });
    }

    // Upsert local user
    await User.upsert({ uid, username });

    // Your app's JWT
    const token = jwt.sign({ uid, username }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({ ok: true, token });
  } catch (err) {
    console.error("PI_LOGIN_ERR", err?.response?.data || err);
    res.status(500).json({ ok: false, message: "Pi login failed" });
  }
});

// POST /api/pi/approve { paymentId }
router.post("/approve", async (req, res) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ ok: false, message: "paymentId required" });

    const { data } = await piAxios().post(`/payments/${paymentId}/approve`);

    await Payment.upsert({
      id: paymentId,
      uid: data?.user_uid,
      amount: data?.amount,
      memo: data?.memo,
      status: "approved"
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("PI_APPROVE_ERR", err?.response?.data || err);
    res.status(500).json({ ok: false, message: "Approve failed" });
  }
});

// POST /api/pi/complete { paymentId, txid }
router.post("/complete", async (req, res) => {
  try {
    const { paymentId, txid } = req.body;
    if (!paymentId || !txid) {
      return res.status(400).json({ ok: false, message: "paymentId and txid required" });
    }

    await piAxios().post(`/payments/${paymentId}/complete`, { txid });

    await Payment.update({ status: "completed", txid }, { where: { id: paymentId } });

    res.json({ ok: true });
  } catch (err) {
    console.error("PI_COMPLETE_ERR", err?.response?.data || err);
    res.status(500).json({ ok: false, message: "Complete failed" });
  }
});

// debug helper
router.get("/payments", async (_req, res) => {
  const items = await Payment.findAll({ order: [["createdAt", "DESC"]] });
  res.json({ ok: true, items });
});

export default router;
