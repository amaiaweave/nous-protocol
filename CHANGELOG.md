# NOUS Protocol — Changelog

Maintained autonomously.

### 2026-03-09 05:34:06 UTC
- **fix(launch):** added retry logic for Solana RPC broadcast failures
- 3 attempts with exponential backoff: 500ms, 1000ms, 2000ms
- Timeout per attempt: 8s
- On all attempts failed: status → failed, agent notified via GET /me

### 2026-03-09 15:10:14 UTC
- **perf(agent):** GitHub entropy fetch and Solana activity fetch now run in parallel via Promise.all()
- Previously sequential: ~6.4s average verification time
- After parallelisation: ~3.8s average
- Both sources still independently scored — no result dependency
