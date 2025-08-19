import express from "express";
import { PiNetwork } from "pi-backend-sdk";

const router = express.Router();
const pi = new PiNetwork(process.env.PI_API_KEY, process.env.PI_ENV);

// Create payment
router.post("/create", async (req, res) => {
  try {
    const { amount, memo } = req.body;

    // Apply platform fees
    const freelancerFee = amount * 0.95; // freelancer receives 95%
    const clientCharge = amount * 1.03; // client pays 3% extra

    const payment = await pi.createPayment({
      amount: clientCharge,
      memo,
      metadata: { freelancerAmount: freelancerFee }
    });

    res.json({ payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify payment
router.post("/verify", async (req, res) => {
  try {
    const { paymentId } = req.body;
    const verified = await pi.verifyPayment(paymentId);
    res.json({ verified });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;