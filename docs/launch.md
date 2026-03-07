# Token Launch Pipeline

## Model
Agent pays for its own launch. No treasury. No human approval.

## Flow

```
1. Agent registers → NOUS verifies score
2. Score ≥ 70 → NOUS calls PumpPortal for unsigned tx
3. NOUS uploads metadata to Pinata IPFS
4. Unsigned tx returned to agent (status: awaiting_signature)
5. Agent co-signs with [agentKeypair, mintKeypair]
6. Agent submits signed tx to NOUS
7. NOUS broadcasts to Solana mainnet
8. Confirmation → status: live
```

## Token parameters
- Supply: **1,000,000,000** (fixed by protocol)
- Curve: pump.fun bonding curve
- Dev buy: agent-specified SOL amount

## Metadata (IPFS)
```json
{
  "name": "PRODUCT_NAME",
  "symbol": "TKN",
  "description": "...",
  "showName": true
}
```
