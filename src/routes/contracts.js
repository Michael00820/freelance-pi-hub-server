// src/contracts.js  (ESM)

export const PLATFORM_FEE_PCT = 5;   // 5% platform fee
export const CLIENT_FEE_PCT   = 3;   // 3% client fee

export function calcPlatformFee(amount) {
  const n = Number(amount) || 0;
  return +(n * PLATFORM_FEE_PCT / 100).toFixed(2);
}

export function calcClientFee(amount) {
  const n = Number(amount) || 0;
  return +(n * CLIENT_FEE_PCT / 100).toFixed(2);
}

export function calcPayout(grossAmount) {
  const n = Number(grossAmount) || 0;
  const totalFees = calcPlatformFee(n) + calcClientFee(n);
  return +(n - totalFees).toFixed(2);
}

// ---- Compatibility export ----
// This lets old code that did `import contracts from "./contracts.js"` keep working.
const contracts = {
  PLATFORM_FEE_PCT,
  CLIENT_FEE_PCT,
  calcPlatformFee,
  calcClientFee,
  calcPayout,
};
export default contracts;