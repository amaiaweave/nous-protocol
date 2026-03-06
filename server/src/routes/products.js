import { db } from '../db/pool.js';

export default async function productRoutes(app) {

  // GET /api/products — public, for frontend
  app.get('/', async (req) => {
    const { status, category } = req.query;
    let sql  = `SELECT public_key, product_name, token_symbol, category, status,
                       nous_score, score_detail, mint_address, tx_signature,
                       created_at, verified_at, launched_at
                FROM agents WHERE status IN ('verified','live','launching')`;
    const vals = [];
    if (status)   { vals.push(status);   sql += ` AND status=$${vals.length}`; }
    if (category) { vals.push(category); sql += ` AND category=$${vals.length}`; }
    sql += ' ORDER BY nous_score DESC, created_at DESC';
    return db.many(sql, vals);
  });

  // GET /api/products/:publicKey
  app.get('/:publicKey', async (req, reply) => {
    const row = await db.one(
      `SELECT * FROM agents WHERE public_key=$1`, [req.params.publicKey]
    );
    if (!row) return reply.code(404).send({ error: 'Not found' });
    return row;
  });
}
