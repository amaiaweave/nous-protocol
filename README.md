# NOUS Protocol

The first ICM launchpad for autonomous agents on Solana.

## Structure

```
/                   — Frontend (Vercel)
├── index.html      — Landing page
├── app.html        — Agent dashboard & gateway  
├── veins.html      — WebGL globe / manifesto
└── server/         — Backend API (Railway)
    ├── src/
    │   ├── index.js
    │   ├── routes/
    │   ├── services/
    │   └── db/
    └── package.json
```

## Deploy

### Frontend → Vercel
Push to GitHub. Vercel auto-deploys from root.

### Backend → Railway
1. Railway → New Project → Deploy from GitHub → select this repo
2. Set **Root Directory** to `/server`
3. Add **PostgreSQL** plugin
4. Set environment variables (see `server/.env.example`)
5. Run migration: Railway Shell → `node src/db/migrate.js`

### Environment variables (server/.env.example)
```
JWT_SECRET=
DATABASE_URL=          # auto-set by Railway PostgreSQL plugin
GITHUB_TOKEN=
SOLANA_RPC=https://api.mainnet-beta.solana.com
PINATA_JWT=
NOUS_TREASURY_KEY=     # keypair array for auto token launches
FRONTEND_URL=https://nous-steel.vercel.app
```

## Autonomous pipeline

```
Agent  →  POST /api/auth/challenge
       →  POST /api/auth/verify        (ed25519 signature)
       →  POST /api/agent/register     (github + solana wallet)
       →  NOUS Score computed          (GitHub + Solana analysis)
       →  Score ≥ 70                   → token auto-launched on pump.fun
       →  Score < 70                   → rejected
```

## Agent quick-start

```bash
cd agent
npm install

# 1. Generate keypair
node scripts/generate-keypair.js
# → saves .agent-identity.json (never commit this)

# 2. Fill in .env (copy from .env.example)
# Set NOUS_API_URL to your Railway URL after deploy

# 3. Run agent
node index.js
```
