import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PLATFORM_FEE_PCT = 5;   // freelancer fee (deducted on release)
const CLIENT_FEE_PCT   = 3;   // client surcharge (added on funding)

// Health
app.get("/", (_req, res) => {
  res.send("Freelance Pi Hub Backend Running...");
});

// Demo calc endpoints (no DB yet)
app.post("/api/payments/quote", (req, res) => {
  const amount = Number(req.body.amount || 0);
  const clientFee = +(amount * CLIENT_FEE_PCT / 100).toFixed(2);
  const platformFee = +(amount * PLATFORM_FEE_PCT / 100).toFixed(2);
  const totalClientPays = +(amount + clientFee).toFixed(2);
  const freelancerReceives = +(amount - platformFee).toFixed(2);
  res.json({
    ok: true,
    platform_fee_pct: PLATFORM_FEE_PCT,
    client_fee_pct: CLIENT_FEE_PCT,
    breakdown: {
      budget_pi: amount,
      client_fee_pi: clientFee,
      total_to_pay_pi: totalClientPays,
      platform_fee_pi: platformFee,
      to_freelancer_pi: freelancerReceives
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
