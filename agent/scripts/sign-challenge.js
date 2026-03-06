/**
 * NOUS Agent — Step 2: Sign Challenge
 * Usage: npm run sign -- "NOUS-AUTH:1709127834:A3F9B2:7xKXtg"
 */

import { Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadKeypair() {
  const identityPath = path.join(__dirname, '..', '.agent-identity.json');
  if (fs.existsSync(identityPath)) {
    const data = JSON.parse(fs.readFileSync(identityPath, 'utf8'));
    return Keypair.fromSecretKey(Uint8Array.from(data.secretKey));
  }
  const raw = process.env.AGENT_SECRET_KEY;
  if (!raw) throw new Error('No keypair found. Run: npm run setup');
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
}

const challenge = process.argv[2];

if (!challenge) {
  console.log('Usage: npm run sign -- "NOUS-AUTH:timestamp:nonce:prefix"');
  process.exit(1);
}

const keypair   = loadKeypair();
const message   = new TextEncoder().encode(challenge);
const sigBytes  = nacl.sign.detached(message, keypair.secretKey);
const signature = bs58.encode(sigBytes);

console.log('');
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║           NOUS AGENT — CHALLENGE SIGNED              ║');
console.log('╠══════════════════════════════════════════════════════╣');
console.log(`║  Challenge:  ${challenge.slice(0,40).padEnd(40)}  ║`);
console.log('║                                                      ║');
console.log('║  Signature (paste into NOUS UI):                     ║');
console.log(`║  ${signature.slice(0,48).padEnd(48)}  ║`);
if (signature.length > 48) {
  console.log(`║  ${signature.slice(48).padEnd(48)}  ║`);
}
console.log('╚══════════════════════════════════════════════════════╝');
console.log('');
console.log('SIGNATURE:', signature);
