import { db } from '../db/pool.js';
import { runVerification } from '../services/verify.js';
import { prepareLaunchTx, submitSignedTx } from '../services/launch.js';

export default async function agentRoutes(app) {

  // POST /api/agent/register
  app.post('/register', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { publicKey } = req.user;
    const { productName, productDesc, tokenSymbol, category, githubRepo, solanaWallet, devBuy } = req.body || {};

    if (!githubRepo)   return reply.code(400).send({ error: 'githubRepo required' });
    if (!tokenSymbol)  return reply.code(400).send({ error: 'tokenSymbol required' });
    if (!solanaWallet) return reply.code(400).send({ error: 'solanaWallet required' });

    const agent = await db.one(
      `UPDATE agents SET
         product_name  = $2,
         product_desc  = $3,
         token_symbol  = $4,
         category      = $5,
         github_repo   = $6,
         solana_wallet = $7,
         dev_buy       = $8,
         status        = 'pending'
       WHERE public_key = $1
       RETURNING *`,
      [publicKey, productName, productDesc, tokenSymbol, category, githubRepo, solanaWallet, devBuy || 0.001]
    );

    // Async: verify → if passed, prepare launch tx
    setImmediate(async () => {
      try {
        console.log(`[pipeline] Verifying ${publicKey}...`);
        const result = await runVerification(agent);

        await db.query(
          `UPDATE agents SET nous_score=$2, score_detail=$3, status=$4, verified_at=NOW() WHERE public_key=$1`,
          [publicKey, result.nousScore, JSON.stringify(result.detail), result.passed ? 'verified' : 'rejected']
        );

        if (result.passed) {
          console.log(`[pipeline] Score ${result.nousScore} ✓ — preparing launch tx...`);
          const updatedAgent = await db.one(`SELECT * FROM agents WHERE public_key=$1`, [publicKey]);
          const launchData = await prepareLaunchTx(updatedAgent);
          // Store tx data so agent can fetch it
          await db.query(
            `UPDATE agents SET score_detail = score_detail || $2 WHERE public_key=$1`,
            [publicKey, JSON.stringify({ launchTx: launchData })]
          );
          console.log(`[pipeline] Tx ready for ${publicKey}`);
        } else {
          console.log(`[pipeline] Score ${result.nousScore} ✗ — rejected`);
        }
      } catch (err) {
        console.error(`[pipeline] Error for ${publicKey}:`, err.message);
      }
    });

    return { status: 'pending', message: 'Verification started. Poll GET /api/agent/me for status.' };
  });

  // GET /api/agent/me — agent polls this to check status + get launch tx when ready
  app.get('/me', { onRequest: [app.authenticate] }, async (req, reply) => {
    const agent = await db.one(`SELECT * FROM agents WHERE public_key=$1`, [req.user.publicKey]);
    if (!agent) return reply.code(404).send({ error: 'Not found' });
    return agent;
  });

  // POST /api/agent/launch/submit — agent submits signed tx
  app.post('/launch/submit', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { publicKey } = req.user;
    const { signedTx } = req.body || {};

    if (!signedTx) return reply.code(400).send({ error: 'signedTx (base64) required' });

    const agent = await db.one(`SELECT status FROM agents WHERE public_key=$1`, [publicKey]);
    if (!agent) return reply.code(404).send({ error: 'Agent not found' });
    if (agent.status !== 'awaiting_signature')
      return reply.code(400).send({ error: `Cannot submit tx in status: ${agent.status}` });

    try {
      const result = await submitSignedTx(publicKey, signedTx);
      return { ok: true, ...result };
    } catch (err) {
      return reply.code(500).send({ error: err.message });
    }
  });

  // POST /api/agent/heartbeat
  app.post('/heartbeat', { onRequest: [app.authenticate] }, async (req, reply) => {
    await db.query(
      `INSERT INTO heartbeats (public_key, payload) VALUES ($1, $2)`,
      [req.user.publicKey, JSON.stringify(req.body)]
    );
    return { ok: true };
  });
}
