import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { db } from '../db/pool.js';

export function makeChallenge(publicKey) {
  const ts    = Date.now();
  const nonce = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `NOUS-AUTH:${ts}:${nonce}:${publicKey.slice(0, 8)}`;
}

export function verifySignature(challenge, signatureB58, publicKeyB58) {
  try {
    const message     = new TextEncoder().encode(challenge);
    const signature   = bs58.decode(signatureB58);
    const pubkeyBytes = bs58.decode(publicKeyB58);
    return nacl.sign.detached.verify(message, signature, pubkeyBytes);
  } catch {
    return false;
  }
}

export async function storeChallenge(publicKey, challenge) {
  await db.query(
    `INSERT INTO challenges (public_key, challenge) VALUES ($1, $2)`,
    [publicKey, challenge]
  );
}

export async function validateChallenge(publicKey, challenge) {
  const row = await db.one(
    `SELECT id FROM challenges
     WHERE public_key = $1 AND challenge = $2
       AND used = FALSE AND expires_at > NOW()`,
    [publicKey, challenge]
  );
  if (!row) return false;
  await db.query(`UPDATE challenges SET used = TRUE WHERE id = $1`, [row.id]);
  return true;
}
