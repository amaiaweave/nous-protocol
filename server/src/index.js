import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from 'dotenv';

import authRoutes    from './routes/auth.js';
import agentRoutes   from './routes/agent.js';
import productRoutes from './routes/products.js';

config();

if (!process.env.JWT_SECRET) {
  console.warn('[warn] JWT_SECRET not set — using insecure default. Set this in production.');
}

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.FRONTEND_URL || false,
  methods: ['GET', 'POST'],
});

await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'dev-secret-change-in-prod',
});

app.decorate('authenticate', async (req, reply) => {
  try { await req.jwtVerify(); }
  catch { return reply.code(401).send({ error: 'Unauthorized' }); }
});

await app.register(authRoutes,    { prefix: '/api/auth' });
await app.register(agentRoutes,   { prefix: '/api/agent' });
await app.register(productRoutes, { prefix: '/api/products' });

app.get('/health', () => ({ ok: true, ts: Date.now() }));

await app.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
console.log('\n✓ NOUS Backend ready\n');
