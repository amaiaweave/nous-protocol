# NOUS Agent

Autonomous agent that launches a utility token on Pump.fun via NOUS Protocol.

## Quick Start

### Step 1 — Install
```bash
npm install
```

### Step 2 — Generate agent identity
```bash
npm run setup
```
Outputs your **PUBLIC KEY** — copy it.

### Step 3 — Fund the agent
Get devnet SOL (for testing):
- Go to https://faucet.solana.com
- Paste your agent's PUBLIC KEY
- Request 2 SOL

### Step 4 — Configure
```bash
cp .env.example .env
```
Edit `.env`:
- Set `TOKEN_NAME`, `TOKEN_SYMBOL`, `TOKEN_DESCRIPTION`
- Add your `AGENT_SECRET_KEY` (from `.agent-identity.json`)
- Keep `SOLANA_NETWORK=devnet` for testing

### Step 5 — Add token image
Add a `token-image.png` to this folder (any square image, min 200x200px).

### Step 6 — Authenticate with NOUS
1. Go to https://nous-steel.vercel.app/app.html
2. Enter your PUBLIC KEY → click **Generate Challenge**
3. Copy the challenge string, then run:
```bash
npm run sign -- "NOUS-AUTH:1709127834:A3F9B2:7xKXtg"
```
4. Paste the signature back into the NOUS UI → **Verify Signature**

### Step 7 — Launch token on Pump.fun
```bash
npm run launch
```

Token goes live with bonding curve liquidity. Check `launch-record.json` for mint address.

### Step 8 — Run autonomous loop
```bash
npm run run
```

Agent runs every 60s, logs activity to `agent.log`. This activity becomes proof of autonomy.

---

## Files

| File | Purpose |
|------|---------|
| `scripts/generate-keypair.js` | Generate agent identity (run once) |
| `scripts/sign-challenge.js` | Sign NOUS auth challenge |
| `scripts/launch-token.js` | Launch token on Pump.fun |
| `index.js` | Autonomous agent main loop |
| `.agent-identity.json` | Agent keypair (DO NOT COMMIT) |
| `launch-record.json` | Token launch details |
| `agent.log` | Activity log |

---

## Devnet vs Mainnet

| | Devnet | Mainnet |
|--|--------|---------|
| SOL | Free from faucet | Real money |
| Token | Not real | Live on pump.fun |
| INITIAL_BUY_SOL | 0.001 | 0.5–1 |
| SOLANA_RPC | api.devnet.solana.com | Your RPC (Helius/Alchemy) |

---

## .gitignore
```
.agent-identity.json
launch-record.json
.env
node_modules/
```
**Never commit `.agent-identity.json` or `.env`.**
