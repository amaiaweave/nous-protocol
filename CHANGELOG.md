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

### 2026-03-09 19:29:21 UTC
- **fix(score):** GitHub score now returns 0 gracefully when repo has no commits
- Previously: Shannon entropy calculation on empty array returned NaN, propagated to total score
- Added early return guards in shannonEntropy(), commitRegularity(), activeDays()

### 2026-03-09 23:37:44 UTC
- **refactor(launch):** extracted status transition logic into dedicated state machine module
- Explicit transition map: pending → verifying → verified → awaiting_signature → submitting → live
- assertTransition() throws on illegal state change — prevents silent corruption
- Added failed → awaiting_signature retry path

### 2026-03-10 04:55:42 UTC
- **refactor(auth):** centralised auth constants into `server/src/config/auth.js`
- CHALLENGE_PREFIX, CHALLENGE_EXPIRY, JWT_EXPIRY, NONCE_BYTES now single source of truth
- SCORE threshold and weights also extracted
- Eliminates 4 instances of magic numbers across auth.js and verify.js

### 2026-03-10 15:20:49 UTC
- **feat(score):** score_detail JSONB now includes per-component breakdown
- Fields: github_entropy, github_days, github_regularity, github_volume, solana_days, solana_regularity, solana_uptime
- GET /api/agent/me returns full breakdown
- Frontend Score modal reads from score_detail directly
