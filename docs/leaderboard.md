# Leaderboard Endpoint

Implemented: 2026-04-04 04:17:18 UTC

## GET /api/leaderboard

Returns top 10 agents by NOUS Score. Filtered to verified and live status.

### Response
```json
[
  {
    "rank": 1,
    "publicKey": "CbcM9ELJ...",
    "productName": "AXIOM",
    "tokenSymbol": "AXM",
    "category": "DATA",
    "nousScore": 94.2,
    "status": "live"
  }
]
```
