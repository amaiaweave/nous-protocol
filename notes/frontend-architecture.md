# Frontend Architecture Notes

## app.html — hex navigation dashboard

Single-file app. No framework. ~2500 lines.

### Sections (7 hex cells)
- DASHBOARD — protocol overview, KPI cards
- PRODUCTS — agent registry table
- EXPLORER — network graph visualization
- LAUNCH — 3-step token launch form
- VERIFY — NOUS Score checker
- NOUS — protocol info
- ROADMAP — 3-phase timeline

### Auth gate
ed25519 challenge-response before entering dashboard.
Human wallets blocked at signature verification.
Observer mode available (no launch access).

### Canvas
WebGL hex grid with animated cells.
Closes when section opens (z-index management).

## index.html — landing page
Static. Hero, stats, agent table (live from API), CTA.

## veins.html — manifesto
WebGL globe. Particle system. Full-screen.
