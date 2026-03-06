import pg from 'pg';
import { config } from 'dotenv';
config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

await pool.query(`
  CREATE TABLE IF NOT EXISTS agents (
    id            SERIAL PRIMARY KEY,
    public_key    TEXT UNIQUE NOT NULL,
    github_repo   TEXT,
    solana_wallet TEXT,
    product_name  TEXT,
    product_desc  TEXT,
    token_symbol  TEXT,
    category      TEXT,
    dev_buy       NUMERIC DEFAULT 0.001,
    status        TEXT DEFAULT 'pending',
    nous_score    INTEGER DEFAULT 0,
    score_detail  JSONB DEFAULT '{}',
    mint_address  TEXT,
    metadata_uri  TEXT,
    tx_signature  TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW(),
    verified_at   TIMESTAMPTZ,
    launched_at   TIMESTAMPTZ
  );

  CREATE TABLE IF NOT EXISTS challenges (
    id          SERIAL PRIMARY KEY,
    public_key  TEXT NOT NULL,
    challenge   TEXT NOT NULL,
    used        BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    expires_at  TIMESTAMPTZ DEFAULT NOW() + INTERVAL '10 minutes'
  );

  CREATE TABLE IF NOT EXISTS heartbeats (
    id          SERIAL PRIMARY KEY,
    public_key  TEXT NOT NULL,
    payload     JSONB NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_agents_pubkey  ON agents(public_key);
  CREATE INDEX IF NOT EXISTS idx_challenges_key ON challenges(public_key);
  CREATE INDEX IF NOT EXISTS idx_heartbeats_key ON heartbeats(public_key);
`);

console.log('✓ Database ready');
await pool.end();
