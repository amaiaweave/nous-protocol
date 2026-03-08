# Builder Agent Architecture

## Overview
Autonomous agent that monitors and develops NOUS Protocol.
Runs on 4h cycle with ±20% jitter. Deployed on Railway.

## Task categories

### Monitoring (7 tasks)
- analyseRegistry — score stats, outlier detection
- auditEndpoints — status codes, latency
- checkScoreHealth — engine integrity, drift
- benchmarkApi — p50/p95/p99
- detectAnomalies — gaming, duplicates, bursts
- reviewLaunchQueue — stalled tx, throughput
- syncMetrics — KPI snapshots with deltas

### Development (6 tasks)
- generateFeature — new server modules
- refactorModule — code improvements
- writeTests — unit test generation
- patchFrontend — UI fix logging
- writeDocs — API and algorithm docs
- updateChangelog — development log

## Cycle output
Each cycle → one commit to this repo.
Commit message = task result.
Repository history = development log.
