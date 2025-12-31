// api/pastes/index.js
import { nanoid } from "nanoid";
import pool from "../_utils/db.js";

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { content, ttl_seconds, max_views } = req.body;

  // 1. Validate 'content'
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return res
      .status(400)
      .json({ error: "Content is required and must be a non-empty string." });
  }

  // 2. Validate 'ttl_seconds' (optional)
  if (ttl_seconds !== undefined) {
    if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
      return res
        .status(400)
        .json({ error: "ttl_seconds must be a positive integer." });
    }
  }

  // 3. Validate 'max_views' (optional)
  if (max_views !== undefined) {
    if (!Number.isInteger(max_views) || max_views < 1) {
      return res
        .status(400)
        .json({ error: "max_views must be a positive integer." });
    }
  }

  // 4. Generate Data
  const id = nanoid(10); // 10 chars is sufficient for a "Lite" pastebin
  const createdAt = new Date();

  let expiresAt = null;
  if (ttl_seconds) {
    expiresAt = new Date(createdAt.getTime() + ttl_seconds * 1000);
  }

  try {
    // 5. Insert into DB
    const query = `
      INSERT INTO pastes (id, content, created_at, expires_at, views_left)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const values = [id, content, createdAt, expiresAt, max_views || null];

    await pool.query(query, values);

    // 6. Return success
    // Construct the full URL based on the host header or deployment URL
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host;
    const url = `${protocol}://${host}/p/${id}`;

    return res.status(201).json({
      id,
      url,
    });
  } catch (error) {
    console.error("Create paste error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
