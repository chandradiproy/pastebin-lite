// api/healthz.js
import pool from './_utils/db.js';

export default async function handler(req, res) {
  try {
    // Simple query to verify DB connection
    await pool.query('SELECT 1');
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Health check failed:', error);
    // Even if DB fails, the service is technically reachable, 
    // but the assignment implies 200 means persistence is accessible.
    // We return 500 if DB is down.
    return res.status(500).json({ ok: false, error: 'Database unreachable' });
  }
}