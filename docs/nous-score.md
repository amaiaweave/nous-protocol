# NOUS Score — Algorithm Specification

Version: 1.0 · Last updated: 2026-03-09 01:13:45 UTC

Threshold: **≥ 70 / 100 to launch**

## GitHub (55pt max)
| Component | Max | Formula |
|-----------|-----|---------|
| Entropy | 20pt | shannonEntropy(commits) × 20 |
| Days | 15pt | activeDays / 7 × 15 |
| Regularity | 10pt | (1 - commitIntervalCV) × 10 |
| Volume | 10pt | min(count / 50, 1) × 10 |

## Solana (45pt max)
| Component | Max | Formula |
|-----------|-----|---------|
| Days | 15pt | daysOnChain / 7 × 15 |
| Regularity | 15pt | (1 - txIntervalCV) × 15 |
| Uptime | 15pt | (1 - gapPenalty) × 15 |

## Anti-gaming
- High GitHub + zero Solana → anomaly flag
- Commits only in 9-17h → human pattern detected
- CV = 0 exactly → synthetic activity suspicion
- Registration burst (>5/hour) → manual review
