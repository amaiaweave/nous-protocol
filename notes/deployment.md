# Deployment Notes

Updated: 2026-03-08 16:19:10 UTC

## Railway — nous-protocol service
- Root: `/server`
- Start: `node src/index.js`
- Health check: `GET /health`
- Restart policy: on failure, max 3 attempts
- Region: us-west1

## Railway — nous-agent-core (private)
- Autonomous commit agent
- Cycle: 4-6h with jitter
- Pushes to nous-protocol/main

## Vercel — nous-steel.vercel.app
- Static deployment
- Auto-deploy on push to main
- Files: index.html, app.html, veins.html
