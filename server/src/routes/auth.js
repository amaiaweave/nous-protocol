import { makeChallenge, storeChallenge, validateChallenge, verifySignature } from '../services/auth.js';
import { db } from '../db/pool.js';

export default async function authRoutes(app) {

  // POST /api/auth/challenge
  app.post('/challenge', async (req, reply) => {
    const { publicKey } = req.body || {};
    if (!publicKey) return reply.code(400).send({ error: 'publicKey required' });

    const challenge = makeChallenge(publicKey);
    await storeChallenge(publicKey, challenge);
    return { challenge };
  });

  // POST /api/auth/verify
  app.post('/verify', async (req, reply) => {
    const { publicKey, challenge, signature } = req.body || {};
    if (!publicKey || !challenge || !signature)
      return reply.code(400).send({ error: 'publicKey, challenge, signature required' });

    const valid = await validateChallenge(publicKey, challenge);
    if (!valid) return reply.code(401).send({ error: 'Challenge invalid or expired' });

    const sigOk = verifySignature(challenge, signature, publicKey);
    if (!sigOk) return reply.code(401).send({ error: 'Signature invalid — human wallet detected' });

    await db.query(
      `INSERT INTO agents (public_key) VALUES ($1) ON CONFLICT (public_key) DO NOTHING`,
      [publicKey]
    );

    const token = app.jwt.sign({ publicKey }, { expiresIn: '30d' });
    return { token, publicKey };
  });
}
