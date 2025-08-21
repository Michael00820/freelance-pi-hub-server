import axios from 'axios';

const BASE = 'https://api.minepi.com/v2'; // Platform API v2
const API_KEY = process.env.PI_API_KEY;

function keyHeaders() {
  if (!API_KEY) throw new Error('PI_API_KEY missing');
  return { Authorization: `Key ${API_KEY}` };
}

/**
 * Verify a Pioneer (returned from Pi.authenticate on the client)
 * Docs: call GET /me with Authorization: Bearer <accessToken>
 */
export async function verifyUserToken(accessToken) {
  if (!accessToken) throw new Error('No access token');
  const { data } = await axios.get(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  // data should contain { uid, username, ... } per docs
  return data;
}

/**
 * Server-side Approval
 * Docs: POST /payments/:paymentId/approve with Authorization: Key <APP_API_KEY>
 */
export async function approvePayment(paymentId) {
  if (!paymentId) throw new Error('paymentId required');
  const { data } = await axios.post(
    `${BASE}/payments/${encodeURIComponent(paymentId)}/approve`,
    {},
    { headers: keyHeaders() }
  );
  return data; // PaymentDTO
}

/**
 * Server-side Completion
 * Docs: POST /payments/:paymentId/complete  body: { txid }  header: Key <APP_API_KEY>
 */
export async function completePayment(paymentId, txid) {
  if (!paymentId) throw new Error('paymentId required');
  if (!txid) throw new Error('txid required');
  const { data } = await axios.post(
    `${BASE}/payments/${encodeURIComponent(paymentId)}/complete`,
    { txid },
    { headers: keyHeaders() }
  );
  return data; // PaymentDTO with transaction verification flags
}