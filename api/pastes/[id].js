// api/pastes/[id].js
import pool from '../_utils/db.js';
import { getCurrentTime } from '../_utils/time.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const now = getCurrentTime(req);

    // ATOMIC TRANSACTION LOGIC:
    // We want to fetch the paste AND potentially decrement the view count
    // in a single step to prevent race conditions.
    
    // Logic:
    // 1. Filter by ID.
    // 2. Filter by Expiry (if set).
    // 3. Filter by Views Left (if set).
    // 4. If a row matches, decrement views_left (if not null) and return the data.
    
    const query = `
      UPDATE pastes
      SET views_left = CASE 
          WHEN views_left IS NOT NULL THEN views_left - 1 
          ELSE views_left 
        END
      WHERE id = $1
        AND (expires_at IS NULL OR expires_at > $2)
        AND (views_left IS NULL OR views_left > 0)
      RETURNING content, views_left, expires_at;
    `;
    
    // $1 = id, $2 = current time (real or simulated)
    const values = [id, now];
    
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      // No row returned means either:
      // 1. ID doesn't exist.
      // 2. ID exists but expired (TTL).
      // 3. ID exists but views_left was 0.
      return res.status(404).json({ error: 'Paste not found or unavailable' });
    }

    const paste = result.rows[0];

    // Response format required by assignment
    return res.status(200).json({
      content: paste.content,
      remaining_views: paste.views_left, // This is the value AFTER decrement (because of RETURNING)
      expires_at: paste.expires_at
    });

  } catch (error) {
    console.error('Get paste error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}