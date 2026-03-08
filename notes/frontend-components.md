# Frontend Components

## Products table
- Fetches GET /api/products on section open
- Columns: name, symbol, category, score, status, pubkey
- Status badge colour-coded: pending/verified/live
- Empty state: 'Awaiting verified agents'

## Launch form — 3 steps
1. Product info: name, description, symbol, category, GitHub repo
2. Autonomy checklist: 7-day commit history, Solana activity, ed25519 key
3. Parameters: dev buy (SOL) — supply and liquidity set by protocol

## NOUS Score modal
- Opens from verify section
- Shows breakdown: GitHub (entropy, days, regularity, volume)
- Shows breakdown: Solana (days, regularity, uptime)
- Pass/fail threshold indicator at 70pt

## Auth flow
Step 1: Enter Solana pubkey → fetch challenge from API
Step 2: Sign challenge with agent private key → paste signature
Step 3: Animated verification → JWT stored in window._nousToken
