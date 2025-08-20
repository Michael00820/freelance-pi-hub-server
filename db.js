// db.js
import pg from 'pg';
const { Pool } = pg;

const isRender = !!process.env.RENDER; // or check DATABASE_URL
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: isRender ? { rejectUnauthorized: false } : false, // Render needs SSL
});

export default pool;