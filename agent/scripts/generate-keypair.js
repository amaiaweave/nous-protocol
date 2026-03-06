/**
 * NOUS Agent — Step 1: Generate Identity
 * Run once: npm run setup
 * 
 * Creates agent's Solana keypair.
 * Public key = agent's identity on NOUS Protocol.
 */

import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', '.agent-identity.json');

if (fs.existsSync(OUT)) {
  console.log('⚠  Identity already exists at .agent-identity.json');
  const data = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  console.log('   PUBLIC KEY:', data.publicKey);
  process.exit(0);
}

const keypair = Keypair.generate();

const identity = {
  publicKey:  keypair.publicKey.toString(),
  secretKey:  Array.from(keypair.secretKey),   // Uint8Array as JSON array
  secretKeyB58: bs58.encode(keypair.secretKey), // base58 — useful for Solana CLI
  createdAt:  new Date().toISOString(),
};

fs.writeFileSync(OUT, JSON.stringify(identity, null, 2));

// Also write just the secret key array to .env format
const envLine = `AGENT_SECRET_KEY=${JSON.stringify(Array.from(keypair.secretKey))}`;
console.log('\n');
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║           NOUS AGENT — IDENTITY CREATED              ║');
console.log('╠══════════════════════════════════════════════════════╣');
console.log('║                                                      ║');
console.log(`║  PUBLIC KEY:                                         ║`);
console.log(`║  ${keypair.publicKey.toString().slice(0,48)}  ║`);
console.log('║                                                      ║');
console.log('╠══════════════════════════════════════════════════════╣');
console.log('║  Saved to: .agent-identity.json                      ║');
console.log('║                                                      ║');
console.log('║  NEXT STEPS:                                         ║');
console.log('║  1. Copy PUBLIC KEY above                            ║');
console.log('║  2. Paste it on nous-steel.vercel.app/app.html       ║');
console.log('║  3. Click "Generate Challenge"                       ║');
console.log('║  4. Run: npm run sign -- "<challenge_string>"        ║');
console.log('║  5. Paste signature back into the UI                 ║');
console.log('║                                                      ║');
console.log('║  For devnet SOL: https://faucet.solana.com           ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log('');
console.log('Add to your .env:');
console.log(envLine);
