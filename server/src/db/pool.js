import pg from 'pg';
import { config } from 'dotenv';
config();

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export const db = {
  query: (text, params) => pool.query(text, params),
  one:   async (text, params) => { const r = await pool.query(text, params); return r.rows[0] || null; },
  many:  async (text, params) => { const r = await pool.query(text, params); return r.rows; },
};
