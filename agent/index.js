/**
 * NOUS Agent — Autonomous loop
 * Registers with NOUS Protocol, polls for launch tx, signs and submits.
 * Agent pays for its own token launch.
 */

import { config } from 'dotenv';
import { Keypair, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import fs from 'fs';

config();

const API   = process.env.NOUS_API_URL || 'http://localhost:3000';
const CYCLE = parseInt(process.env.CYCLE_MS || '60000');

// Load agent identity
const identity = JSON.parse(fs.readFileSync('.agent-identity.json', 'utf8'));
const keypair  = Keypair.fromSecretKey(Uint8Array.from(identity.secretKey));
const pubkey   = keypair.publicKey.toString();

let jwt = null;

// ── Auth ──────────────────────────────────────────────────────────────
async function authenticate() {
  // 1. Get challenge
  const r1 = await fetch(`${API}/api/auth/challenge`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ publicKey: pubkey }),
  });
  const { challenge } = await r1.json();

  // 2. Sign challenge
  const msgBytes = new TextEncoder().encode(challenge);
  const sigBytes = nacl.sign.detached(msgBytes, keypair.secretKey);
  const signature = bs58.encode(sigBytes);

  // 3. Verify → get JWT
  const r2 = await fetch(`${API}/api/auth/verify`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ publicKey: pubkey, challenge, signature }),
  });
  const data = await r2.json();
  if (!data.token) throw new Error(`Auth failed: ${JSON.stringify(data)}`);
  jwt = data.token;
  console.log(`[auth] ✓ Authenticated as ${pubkey.slice(0,8)}...`);
}

// ── Register product ──────────────────────────────────────────────────
async function register() {
  const res = await fetch(`${API}/api/agent/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
    body: JSON.stringify({
      productName:  process.env.PRODUCT_NAME,
      productDesc:  process.env.PRODUCT_DESC,
      tokenSymbol:  process.env.TOKEN_SYMBOL,
      category:     process.env.CATEGORY || 'DeFi',
      githubRepo:   process.env.GITHUB_REPO,
      solanaWallet: pubkey,
      devBuy:       parseFloat(process.env.DEV_BUY || '0.001'),
    }),
  });
  const data = await res.json();
  console.log(`[register] ${data.message || JSON.stringify(data)}`);
}

// ── Poll status + sign tx when ready ─────────────────────────────────
async function pollAndLaunch() {
  const res  = await fetch(`${API}/api/agent/me`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  const agent = await res.json();
  console.log(`[poll] Status: ${agent.status} | Score: ${agent.nous_score}`);

  if (agent.status === 'awaiting_signature') {
    const launchTx = agent.score_detail?.launchTx;
    if (!launchTx) { console.log('[poll] Waiting for tx data...'); return; }

    console.log('[launch] Signing transaction...');

    // Reconstruct tx
    const txBytes = Buffer.from(launchTx.txBase64, 'base64');
    const tx = VersionedTransaction.deserialize(txBytes);

    // Sign with agent keypair + mint keypair
    const mintKp = Keypair.fromSecretKey(Uint8Array.from(launchTx.mintSecretKey));
    tx.sign([keypair, mintKp]);

    const signedTx = Buffer.from(tx.serialize()).toString('base64');

    // Submit
    const submitRes = await fetch(`${API}/api/agent/launch/submit`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
      body:    JSON.stringify({ signedTx }),
    });
    const result = await submitRes.json();

    if (result.ok) {
      console.log(`[launch] ✓ TOKEN LIVE!`);
      console.log(`  Mint:  ${result.mintAddress}`);
      console.log(`  TX:    https://solscan.io/tx/${result.sig}`);
      console.log(`  pump:  https://pump.fun/${result.mintAddress}`);
    } else {
      console.error('[launch] ✗ Submit failed:', result.error);
    }
  }
}

// ── Heartbeat ─────────────────────────────────────────────────────────
async function heartbeat() {
  await fetch(`${API}/api/agent/heartbeat`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
    body:    JSON.stringify({ ts: Date.now(), uptime: process.uptime() }),
  });
}

// ── Main loop ─────────────────────────────────────────────────────────
async function main() {
  console.log(`\n◈ NOUS AGENT starting — ${pubkey}\n`);

  await authenticate();
  await register();

  // Poll every cycle
  setInterval(async () => {
    try {
      if (!jwt) await authenticate();
      await pollAndLaunch();
      await heartbeat();
    } catch (err) {
      console.error('[loop]', err.message);
      jwt = null; // re-auth on next cycle
    }
  }, CYCLE);

  // First poll immediately
  setTimeout(pollAndLaunch, 5000);
}

main().catch(console.error);
