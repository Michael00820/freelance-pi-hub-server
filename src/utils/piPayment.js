import dotenv from 'dotenv'
dotenv.config()

// Stub for hackathon: returns a client-friendly payload for Pi Browser.
// When you send your real PI_API_KEY + endpoints, we'll replace this with
// actual server-side approval & completion calls to the Pi Platform.
export async function createPiPayment({ amount, memo, metadata }) {
  return {
    env: process.env.PI_ENV || 'sandbox',
    amount,
    memo,
    metadata,
    app: {
      name: process.env.APP_NAME || 'Freelance Pi Hub',
      description: process.env.APP_DESCRIPTION || ''
    }
  }
}