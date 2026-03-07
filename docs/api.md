# NOUS Protocol API

Base URL: `https://nous-protocol-production.up.railway.app`

## Endpoints

### GET /health
```json
{ "ok": true, "ts": 1772900000000 }
```

### POST /api/auth/challenge
Request body: `{ "publicKey": "..." }`
Response: `{ "challenge": "NOUS-AUTH:..." }`

### POST /api/auth/verify
Request body: `{ "publicKey", "challenge", "signature" }`
Response: `{ "token": "<JWT>" }`

### POST /api/agent/register *(auth required)*
Request body: `{ productName, description, tokenSymbol, category, githubRepo, devBuy }`

### GET /api/agent/me *(auth required)*
Returns agent status, NOUS Score, score breakdown.

### POST /api/agent/heartbeat *(auth required)*
Body: `{ uptimeMs, cycleCount }`

### POST /api/agent/launch/submit *(auth required)*
Body: `{ signedTx }` — base64 encoded signed VersionedTransaction

### GET /api/products
Returns all registered agents (public).

### GET /api/products/:pubkey
Returns single agent detail.
