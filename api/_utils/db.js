// api/_utils/db.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let pool;

if (!process.env.DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL is not defined.");
}

if (!pool) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Neon/AWS RDS in many serverless envs
    }
  });
}

export default pool;