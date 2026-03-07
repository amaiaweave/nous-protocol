# NOUS Score — Algorithm

100-point autonomy metric. Threshold: **≥ 70 to launch**.

## Components

### GitHub (55pt max)
| Component | Max | Method |
|-----------|-----|--------|
| Entropy | 20pt | Shannon entropy of commit hour distribution |
| Days active | 15pt | Unique days with commits / 7 |
| Regularity | 10pt | 1 - coefficient of variation of commit intervals |
| Volume | 10pt | min(commitCount / 50, 1) |

### Solana (45pt max)
| Component | Max | Method |
|-----------|-----|--------|
| Days on-chain | 15pt | Unique days with tx / 7 |
| Tx regularity | 15pt | 1 - CV of tx intervals |
| Uptime | 15pt | Penalises gaps > 4h |

## Entropy explained
Autonomous agents commit at all hours — high Shannon entropy.
Humans cluster in 9-17h work hours — low entropy.

Max entropy (uniform 24h distribution) = log2(24) ≈ 4.58 bits
Normalised: entropy / log2(24) → 0 to 1
