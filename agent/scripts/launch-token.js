/**
 * NOUS Agent — Token Launch via Pump.fun (through PumpPortal)
 */

import {
  Connection, Keypair, LAMPORTS_PER_SOL,
  VersionedTransaction,
} from '@solana/web3.js';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();

const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const RPC         = process.env.SOLANA_RPC        || 'https://api.devnet.solana.com';
const NETWORK     = process.env.SOLANA_NETWORK    || 'devnet';
const TOKEN_NAME  = process.env.TOKEN_NAME         || 'NOUS-AGENT';
const TOKEN_SYM   = process.env.TOKEN_SYMBOL       || 'NAGT';
const TOKEN_DESC  = process.env.TOKEN_DESCRIPTION  || 'Autonomous agent token launched via NOUS Protocol';
const INITIAL_BUY = parseFloat(process.env.INITIAL_BUY_SOL || '0.001');
const PINATA_JWT  = process.env.PINATA_JWT;

function loadKeypair() {
  const p = path.join(__dirname, '..', '.agent-identity.json');
  if (fs.existsSync(p)) {
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    return Keypair.fromSecretKey(Uint8Array.from(d.secretKey));
  }
  const raw = process.env.AGENT_SECRET_KEY;
  if (!raw) throw new Error('No keypair. Run: npm run setup');
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
}

async function uploadMetadata(agentPubkey) {
  const localImg = path.join(__dirname, '..', 'token-image.png');
  if (!fs.existsSync(localImg)) {
    throw new Error('token-image.png not found in nous-agent folder.');
  }

  console.log('📦 Uploading image to Pinata...');
  const imgForm = new FormData();
  imgForm.append('file', fs.createReadStream(localImg), {
    filename: 'token-image.png', contentType: 'image/png',
  });
  imgForm.append('pinataMetadata', JSON.stringify({ name: `${TOKEN_SYM}-image` }));

  const imgRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${PINATA_JWT}`, ...imgForm.getHeaders() },
    body: imgForm,
  });
  if (!imgRes.ok) throw new Error(`Pinata image: ${imgRes.status} ${await imgRes.text()}`);
  const imgData  = await imgRes.json();
  const imageUri = `https://gateway.pinata.cloud/ipfs/${imgData.IpfsHash}`;
  console.log('✓ Image:', imageUri);

  console.log('📦 Uploading metadata to Pinata...');
  const metaRes = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${PINATA_JWT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pinataContent: {
        name: TOKEN_NAME, symbol: TOKEN_SYM, description: TOKEN_DESC,
        image: imageUri, website: 'https://nous-steel.vercel.app', createdBy: agentPubkey,
      },
      pinataMetadata: { name: `${TOKEN_SYM}-metadata` },
    }),
  });
  if (!metaRes.ok) throw new Error(`Pinata metadata: ${metaRes.status} ${await metaRes.text()}`);
  const metaData    = await metaRes.json();
  const metadataUri = `https://gateway.pinata.cloud/ipfs/${metaData.IpfsHash}`;
  console.log('✓ Metadata:', metadataUri);
  return metadataUri;
}

async function launch() {
  const connection = new Connection(RPC, 'confirmed');
  const agentKp    = loadKeypair();
  const mintKp     = Keypair.generate();

  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║         NOUS AGENT — TOKEN LAUNCH INITIATED          ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  Network:     ${NETWORK.padEnd(38)}  ║`);
  console.log(`║  Agent:       ${agentKp.publicKey.toString().slice(0,38).padEnd(38)}  ║`);
  console.log(`║  Mint:        ${mintKp.publicKey.toString().slice(0,38).padEnd(38)}  ║`);
  console.log(`║  Name:        ${TOKEN_NAME.padEnd(38)}  ║`);
  console.log(`║  Symbol:      $${TOKEN_SYM.padEnd(37)}  ║`);
  console.log(`║  Initial Buy: ${(INITIAL_BUY + ' SOL').padEnd(38)}  ║`);
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  const balance = await connection.getBalance(agentKp.publicKey);
  const balSOL  = balance / LAMPORTS_PER_SOL;
  console.log(`💰 Balance: ${balSOL.toFixed(4)} SOL`);

  if (balSOL < INITIAL_BUY + 0.01) {
    console.log(`⚠  Need at least ${INITIAL_BUY + 0.01} SOL`);
    console.log(`   Faucet: https://faucet.solana.com`);
    console.log(`   Address: ${agentKp.publicKey.toString()}`);
    process.exit(1);
  }

  const metadataUri = await uploadMetadata(agentKp.publicKey.toString());

  console.log('🚀 Requesting transaction from PumpPortal...');
  const txRes = await fetch('https://pumpportal.fun/api/trade-local', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      publicKey:        agentKp.publicKey.toString(),
      action:           'create',
      tokenMetadata:    { name: TOKEN_NAME, symbol: TOKEN_SYM, uri: metadataUri },
      mint:             mintKp.publicKey.toString(),
      denominatedInSol: 'true',
      amount:           INITIAL_BUY,
      slippage:         10,
      priorityFee:      0.0005,
      pool:             'pump',
    }),
  });

  if (!txRes.ok) throw new Error(`PumpPortal: ${txRes.status} — ${(await txRes.text()).slice(0,300)}`);

  console.log('✍  Agent signing transaction...');
  const txBytes = new Uint8Array(await txRes.arrayBuffer());

  // PumpPortal returns VersionedTransaction (v0)
  const tx = VersionedTransaction.deserialize(txBytes);
  tx.sign([agentKp, mintKp]);

  console.log('📡 Sending to Solana...');
  const sig = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: false, maxRetries: 3,
  });
  await connection.confirmTransaction(sig, 'confirmed');

  const mintAddr    = mintKp.publicKey.toString();
  const explorerUrl = NETWORK === 'mainnet-beta'
    ? `https://pump.fun/${mintAddr}`
    : `https://explorer.solana.com/tx/${sig}?cluster=devnet`;

  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║            ✓ TOKEN LAUNCHED SUCCESSFULLY!            ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  $${TOKEN_SYM.padEnd(49)}  ║`);
  console.log(`║  Mint: ${mintAddr.slice(0,44).padEnd(44)}  ║`);
  console.log(`║  TX:   ${sig.slice(0,44).padEnd(44)}  ║`);
  console.log(`║  URL:  ${explorerUrl.slice(0,44).padEnd(44)}  ║`);
  console.log('╚══════════════════════════════════════════════════════╝');

  fs.writeFileSync(
    path.join(__dirname, '..', 'launch-record.json'),
    JSON.stringify({ mintAddr, sig, network: NETWORK, TOKEN_NAME, TOKEN_SYM,
      metadataUri, launchedAt: new Date().toISOString(),
      agentPubKey: agentKp.publicKey.toString(), explorerUrl }, null, 2)
  );
  console.log('\n✓ Saved to launch-record.json');
}

launch().catch(e => { console.error('\n✗ Launch failed:', e.message); process.exit(1); });
