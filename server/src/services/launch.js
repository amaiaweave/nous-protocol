/**
 * Token Launch — Agent Pays Model
 *
 * Flow:
 * 1. NOUS uploads metadata to IPFS
 * 2. NOUS requests unsigned tx from PumpPortal (using agent's public key)
 * 3. NOUS returns tx + mint keypair to agent
 * 4. Agent signs with own keypair + mint keypair
 * 5. Agent submits signed tx back → POST /api/agent/launch/submit
 * 6. NOUS broadcasts + marks as live
 */

import { Connection, Keypair } from '@solana/web3.js';
import fetch from 'node-fetch';
import { db } from '../db/pool.js';

const RPC        = process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
const PINATA_JWT = process.env.PINATA_JWT;

async function uploadMetadata(agent) {
  if (!PINATA_JWT) throw new Error('PINATA_JWT not set');

  const metadata = {
    name:        agent.product_name || agent.token_symbol,
    symbol:      agent.token_symbol,
    description: agent.product_desc || `Autonomous agent token verified by NOUS Protocol. Score: ${agent.nous_score}/100`,
    website:     'https://nous-steel.vercel.app',
    createdBy:   agent.public_key,
    nousScore:   agent.nous_score,
  };

  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method:  'POST',
    headers: { Authorization: `Bearer ${PINATA_JWT}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ pinataContent: metadata, pinataMetadata: { name: `${agent.token_symbol}-nous-meta` } }),
  });

  if (!res.ok) throw new Error(`Pinata error: ${res.status}`);
  const data = await res.json();
  return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
}

// Step 1 — prepare unsigned tx, return to agent for signing
export async function prepareLaunchTx(agent) {
  console.log(`[launch] Preparing tx for ${agent.public_key}`);

  const metadataUri = await uploadMetadata(agent);
  console.log(`[launch] Metadata: ${metadataUri}`);

  const mintKp = Keypair.generate();

  const txRes = await fetch('https://pumpportal.fun/api/trade-local', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      publicKey:        agent.public_key,
      action:           'create',
      tokenMetadata: {
        name:   agent.product_name || agent.token_symbol,
        symbol: agent.token_symbol,
        uri:    metadataUri,
      },
      mint:             mintKp.publicKey.toString(),
      denominatedInSol: 'true',
      amount:           agent.dev_buy || 0.001,
      slippage:         10,
      priorityFee:      0.0005,
      pool:             'pump',
    }),
  });

  if (!txRes.ok) throw new Error(`PumpPortal: ${txRes.status}`);

  const txBase64 = Buffer.from(new Uint8Array(await txRes.arrayBuffer())).toString('base64');

  await db.query(
    `UPDATE agents SET status='awaiting_signature', metadata_uri=$2, mint_address=$3 WHERE public_key=$1`,
    [agent.public_key, metadataUri, mintKp.publicKey.toString()]
  );

  return {
    txBase64,
    mintPublicKey: mintKp.publicKey.toString(),
    mintSecretKey: Array.from(mintKp.secretKey),
    metadataUri,
  };
}

// Step 2 — agent submits signed tx, NOUS broadcasts
export async function submitSignedTx(publicKey, signedTxBase64) {
  console.log(`[launch] Broadcasting for ${publicKey}`);

  const connection = new Connection(RPC, 'confirmed');
  const txBytes = Buffer.from(signedTxBase64, 'base64');

  const sig = await connection.sendRawTransaction(txBytes, { skipPreflight: false, maxRetries: 3 });
  await connection.confirmTransaction(sig, 'confirmed');

  const agent = await db.one(`SELECT mint_address FROM agents WHERE public_key=$1`, [publicKey]);

  await db.query(
    `UPDATE agents SET status='live', tx_signature=$2, launched_at=NOW() WHERE public_key=$1`,
    [publicKey, sig]
  );

  console.log(`[launch] ✓ Live! TX: ${sig}`);
  return { sig, mintAddress: agent.mint_address };
}
