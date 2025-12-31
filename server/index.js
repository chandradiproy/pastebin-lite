import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";
import pool from "./db.js";
import { getCurrentTime } from "./utils/time.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- API Routes ---

// Health Check
app.get("/api/healthz", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({ ok: false, error: "Database unreachable" });
  }
});

// Create Paste
app.post("/api/pastes", async (req, res) => {
  const { content, ttl_seconds, max_views } = req.body;

  // Validation
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return res
      .status(400)
      .json({ error: "Content is required and must be a non-empty string." });
  }
  if (
    ttl_seconds !== undefined &&
    (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
  ) {
    return res
      .status(400)
      .json({ error: "ttl_seconds must be a positive integer." });
  }
  if (
    max_views !== undefined &&
    (!Number.isInteger(max_views) || max_views < 1)
  ) {
    return res
      .status(400)
      .json({ error: "max_views must be a positive integer." });
  }

  const id = nanoid(10);
  const createdAt = new Date();
  let expiresAt = null;

  if (ttl_seconds) {
    expiresAt = new Date(createdAt.getTime() + ttl_seconds * 1000);
  }

  try {
    const query = `
      INSERT INTO pastes (id, content, created_at, expires_at, views_left)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const values = [id, content, createdAt, expiresAt, max_views || null];
    await pool.query(query, values);

    // Construct URL based on the incoming request protocol and host
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers.host;
    const url = `${protocol}://${host}/p/${id}`;

    res.status(201).json({ id, url });
  } catch (error) {
    console.error("Create paste error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get Paste
app.get("/api/pastes/:id", async (req, res) => {
  const { id } = req.params;
  const now = getCurrentTime(req);

  try {
    // Atomic read-and-decrement
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

    const result = await pool.query(query, [id, now]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Paste not found or unavailable" });
    }

    const paste = result.rows[0];
    res.status(200).json({
      content: paste.content,
      remaining_views: paste.views_left,
      expires_at: paste.expires_at,
    });
  } catch (error) {
    console.error("Get paste error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- Serve Frontend in Production ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// If we are in production (or just running normally), serve the client build
// We assume the client is built to ../client/dist
const clientDistPath = path.join(__dirname, "../client/dist");

app.use(express.static(clientDistPath));

// Handle React Routing, return all other requests to React app
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
