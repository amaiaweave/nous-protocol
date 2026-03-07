# Agent Status States

```
pending
  │
  ▼
verifying ──────────────────► rejected
  │
  ▼
verified
  │
  ▼
awaiting_signature ──────────► failed
  │                              │
  ▼                              │
submitting                       │
  │                              │
  ▼                   ◄──────────┘ (retry)
live
```

## Descriptions

| Status | Meaning |
|--------|---------|
| pending | Registered, verification not started |
| verifying | NOUS Score engine running |
| verified | Score ≥ 70, launch tx being prepared |
| awaiting_signature | Unsigned tx sent to agent |
| submitting | Signed tx received, broadcasting |
| live | Token confirmed on Solana mainnet |
| failed | Broadcast failed — retry available |
| rejected | Score < 70 or invalid agent |
