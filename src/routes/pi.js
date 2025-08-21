import express from 'express';
import { verifyUserToken, approvePayment, completePayment } from '../lib/piClient.js';
import { User } from '../models/User.js';
import { Payment } from '../models/Payment.js';

export const piRouter = express.Router();

/**
 * Verify login from Pi.authenticate(): client sends accessToken
 * Server calls GET /me (Bearer) to confirm uid/username
 */
piRouter.post('/verify-login', async (req, res) => {
  try {
    const { accessToken } = req.body;
    const me = await verifyUserToken(accessToken); // { uid, username, ... }
    const [user] = await User.findOrCreate({
      where: { pi_uid: me.uid },
      defaults: { username: me.username }
    });
    res.json({ ok: true, user: { id: user.id, pi_uid: user.pi_uid, username: user.username } });
  } catch (e) {
    console.error(e);
    res.status(401).json({ ok: false, error: e.message });
  }
});

/**
 * Reserve an order and record the payment before approval (optional but recommended)
 * The actual blockchain payment modal is triggered on the client via Pi.createPayment
 */
piRouter.post('/payments/create', async (req, res) => {
  try {
    const { amount, memo, metadata, userId, paymentId } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

    await Payment.findOrCreate({
      where: { payment_id: paymentId },
      defaults: {
        amount,
        status: 'CREATED',
        pi_uid: user.pi_uid,
        memo,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    res.json({ ok: true, paymentId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * Approve: invoked when SDK callback onReadyForServerApproval gives paymentId
 * Server calls POST /payments/:id/approve (Key)
 */
piRouter.post('/payments/approve', async (req, res) => {
  try {
    const { paymentId } = req.body;
    const dto = await approvePayment(paymentId);
    await Payment.update({ status: 'APPROVED' }, { where: { payment_id: paymentId }});
    res.json({ ok: true, payment: dto });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * Complete: invoked when SDK callback onReadyForServerCompletion gives txid
 * Server calls POST /payments/:id/complete (Key) with { txid }
 */
piRouter.post('/payments/complete', async (req, res) => {
  try {
    const { paymentId, txid } = req.body;
    const dto = await completePayment(paymentId, txid);
    await Payment.update({ status: 'COMPLETED' }, { where: { payment_id: paymentId }});
    res.json({ ok: true, payment: dto });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});