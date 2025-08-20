// db.js
import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

// Render’s managed Postgres requires SSL. The flag below works locally & in Render.
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

export async function query(text, params) {
  return pool.query(text, params);
}