# Deployment Notes

## Backend — Railway
- Service: nous-protocol
- Root directory: /server
- Start: node src/index.js
- Port: auto from process.env.PORT
- PostgreSQL: plugin attached, DATABASE_URL auto-set
- URL: https://nous-protocol-production.up.railway.app

## Frontend — Vercel
- Repo: amaiaweave/nous-protocol
- Static deployment (HTML files)
- URL: https://nous-steel.vercel.app
- Auto-deploy on push to main

## Environment variables (Railway)
- JWT_SECRET ✓
- GITHUB_TOKEN ✓
- SOLANA_RPC ✓
- PINATA_JWT ✓
- FRONTEND_URL ✓
- DATABASE_URL (auto) ✓

## Migration
Run once after deploy:
```bash
railway run node src/db/migrate.js
```
