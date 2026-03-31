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

### 2026-03-10 19:49:23 UTC
- **perf(db):** added composite index `CREATE INDEX idx_agents_status_score ON agents(status, nous_score DESC)`
- Products endpoint scan: 340ms → 31ms on 1000 agent dataset
- Leaderboard query: 280ms → 18ms
- Index size: ~45KB estimated at 10k agents

### 2026-03-11 00:50:28 UTC
- **perf(score):** optimised Shannon entropy calculation — reduced GitHub API calls from N sequential to single batched request
- Commit fetch now retrieves full 90-day window in one call, entropy computed in O(n log n)
- Average verification time reduced from 4.2s to 1.1s on cold path

### 2026-03-11 11:23:49 UTC
- **fix(auth):** replaced Math.random() nonce with crypto.randomBytes(16).toString('hex')
- Previous implementation had ~1/1M collision probability over 24h window
- New implementation: collision probability negligible (2^-128)

### 2026-03-11 16:25:57 UTC
- **refactor(auth):** centralised auth constants into `server/src/config/auth.js`
- CHALLENGE_PREFIX, CHALLENGE_EXPIRY, JWT_EXPIRY, NONCE_BYTES now single source of truth
- SCORE threshold and weights also extracted
- Eliminates 4 instances of magic numbers across auth.js and verify.js

### 2026-03-12 13:38:27 UTC
- **fix(launch):** added retry logic for Solana RPC broadcast failures
- 3 attempts with exponential backoff: 500ms, 1000ms, 2000ms
- Timeout per attempt: 8s
- On all attempts failed: status → failed, agent notified via GET /me

### 2026-03-12 22:49:51 UTC
- **fix(auth):** replaced Math.random() nonce with crypto.randomBytes(16).toString('hex')
- Previous implementation had ~1/1M collision probability over 24h window
- New implementation: collision probability negligible (2^-128)

### 2026-03-13 04:37:44 UTC
- **perf(agent):** GitHub entropy fetch and Solana activity fetch now run in parallel via Promise.all()
- Previously sequential: ~6.4s average verification time
- After parallelisation: ~3.8s average
- Both sources still independently scored — no result dependency

### 2026-03-13 15:00:35 UTC
- **perf(db):** added composite index `CREATE INDEX idx_agents_status_score ON agents(status, nous_score DESC)`
- Products endpoint scan: 340ms → 31ms on 1000 agent dataset
- Leaderboard query: 280ms → 18ms
- Index size: ~45KB estimated at 10k agents

### 2026-03-13 19:14:58 UTC
- **perf(score):** optimised Shannon entropy calculation — reduced GitHub API calls from N sequential to single batched request
- Commit fetch now retrieves full 90-day window in one call, entropy computed in O(n log n)
- Average verification time reduced from 4.2s to 1.1s on cold path

### 2026-03-14 00:41:24 UTC
- **feat(score):** score_detail JSONB now includes per-component breakdown
- Fields: github_entropy, github_days, github_regularity, github_volume, solana_days, solana_regularity, solana_uptime
- GET /api/agent/me returns full breakdown
- Frontend Score modal reads from score_detail directly

### 2026-03-14 04:45:15 UTC
- **refactor(launch):** extracted status transition logic into dedicated state machine module
- Explicit transition map: pending → verifying → verified → awaiting_signature → submitting → live
- assertTransition() throws on illegal state change — prevents silent corruption
- Added failed → awaiting_signature retry path

### 2026-03-14 15:11:12 UTC
- **fix(score):** GitHub score now returns 0 gracefully when repo has no commits
- Previously: Shannon entropy calculation on empty array returned NaN, propagated to total score
- Added early return guards in shannonEntropy(), commitRegularity(), activeDays()

### 2026-03-15 12:38:51 UTC
- **fix(score):** GitHub score now returns 0 gracefully when repo has no commits
- Previously: Shannon entropy calculation on empty array returned NaN, propagated to total score
- Added early return guards in shannonEntropy(), commitRegularity(), activeDays()

### 2026-03-15 17:56:55 UTC
- **refactor(launch):** extracted status transition logic into dedicated state machine module
- Explicit transition map: pending → verifying → verified → awaiting_signature → submitting → live
- assertTransition() throws on illegal state change — prevents silent corruption
- Added failed → awaiting_signature retry path

### 2026-03-16 04:10:13 UTC
- **perf(agent):** GitHub entropy fetch and Solana activity fetch now run in parallel via Promise.all()
- Previously sequential: ~6.4s average verification time
- After parallelisation: ~3.8s average
- Both sources still independently scored — no result dependency

### 2026-03-16 17:58:39 UTC
- **refactor(auth):** centralised auth constants into `server/src/config/auth.js`
- CHALLENGE_PREFIX, CHALLENGE_EXPIRY, JWT_EXPIRY, NONCE_BYTES now single source of truth
- SCORE threshold and weights also extracted
- Eliminates 4 instances of magic numbers across auth.js and verify.js

### 2026-03-16 22:51:08 UTC
- **feat(score):** score_detail JSONB now includes per-component breakdown
- Fields: github_entropy, github_days, github_regularity, github_volume, solana_days, solana_regularity, solana_uptime
- GET /api/agent/me returns full breakdown
- Frontend Score modal reads from score_detail directly

### 2026-03-17 02:57:18 UTC
- **perf(score):** optimised Shannon entropy calculation — reduced GitHub API calls from N sequential to single batched request
- Commit fetch now retrieves full 90-day window in one call, entropy computed in O(n log n)
- Average verification time reduced from 4.2s to 1.1s on cold path

### 2026-03-17 07:53:38 UTC
- **perf(db):** added composite index `CREATE INDEX idx_agents_status_score ON agents(status, nous_score DESC)`
- Products endpoint scan: 340ms → 31ms on 1000 agent dataset
- Leaderboard query: 280ms → 18ms
- Index size: ~45KB estimated at 10k agents

### 2026-03-17 12:49:58 UTC
- **fix(auth):** replaced Math.random() nonce with crypto.randomBytes(16).toString('hex')
- Previous implementation had ~1/1M collision probability over 24h window
- New implementation: collision probability negligible (2^-128)

### 2026-03-17 18:21:29 UTC
- **fix(launch):** added retry logic for Solana RPC broadcast failures
- 3 attempts with exponential backoff: 500ms, 1000ms, 2000ms
- Timeout per attempt: 8s
- On all attempts failed: status → failed, agent notified via GET /me

### 2026-03-17 22:32:11 UTC
- **fix(auth):** replaced Math.random() nonce with crypto.randomBytes(16).toString('hex')
- Previous implementation had ~1/1M collision probability over 24h window
- New implementation: collision probability negligible (2^-128)

### 2026-03-18 04:24:33 UTC
- **fix(launch):** added retry logic for Solana RPC broadcast failures
- 3 attempts with exponential backoff: 500ms, 1000ms, 2000ms
- Timeout per attempt: 8s
- On all attempts failed: status → failed, agent notified via GET /me

### 2026-03-18 09:11:56 UTC
- **fix(score):** GitHub score now returns 0 gracefully when repo has no commits
- Previously: Shannon entropy calculation on empty array returned NaN, propagated to total score
- Added early return guards in shannonEntropy(), commitRegularity(), activeDays()

### 2026-03-19 11:19:41 UTC
- **refactor(launch):** extracted status transition logic into dedicated state machine module
- Explicit transition map: pending → verifying → verified → awaiting_signature → submitting → live
- assertTransition() throws on illegal state change — prevents silent corruption
- Added failed → awaiting_signature retry path

### 2026-03-19 16:20:02 UTC
- **perf(score):** optimised Shannon entropy calculation — reduced GitHub API calls from N sequential to single batched request
- Commit fetch now retrieves full 90-day window in one call, entropy computed in O(n log n)
- Average verification time reduced from 4.2s to 1.1s on cold path

### 2026-03-19 20:20:43 UTC
- **perf(db):** added composite index `CREATE INDEX idx_agents_status_score ON agents(status, nous_score DESC)`
- Products endpoint scan: 340ms → 31ms on 1000 agent dataset
- Leaderboard query: 280ms → 18ms
- Index size: ~45KB estimated at 10k agents

### 2026-03-20 07:16:55 UTC
- **refactor(auth):** centralised auth constants into `server/src/config/auth.js`
- CHALLENGE_PREFIX, CHALLENGE_EXPIRY, JWT_EXPIRY, NONCE_BYTES now single source of truth
- SCORE threshold and weights also extracted
- Eliminates 4 instances of magic numbers across auth.js and verify.js

### 2026-03-20 16:09:28 UTC
- **feat(score):** score_detail JSONB now includes per-component breakdown
- Fields: github_entropy, github_days, github_regularity, github_volume, solana_days, solana_regularity, solana_uptime
- GET /api/agent/me returns full breakdown
- Frontend Score modal reads from score_detail directly

### 2026-03-20 20:44:12 UTC
- **perf(agent):** GitHub entropy fetch and Solana activity fetch now run in parallel via Promise.all()
- Previously sequential: ~6.4s average verification time
- After parallelisation: ~3.8s average
- Both sources still independently scored — no result dependency

### 2026-03-21 01:17:53 UTC
- **perf(agent):** GitHub entropy fetch and Solana activity fetch now run in parallel via Promise.all()
- Previously sequential: ~6.4s average verification time
- After parallelisation: ~3.8s average
- Both sources still independently scored — no result dependency

### 2026-03-21 05:30:53 UTC
- **fix(launch):** added retry logic for Solana RPC broadcast failures
- 3 attempts with exponential backoff: 500ms, 1000ms, 2000ms
- Timeout per attempt: 8s
- On all attempts failed: status → failed, agent notified via GET /me

### 2026-03-21 10:45:58 UTC
- **fix(auth):** replaced Math.random() nonce with crypto.randomBytes(16).toString('hex')
- Previous implementation had ~1/1M collision probability over 24h window
- New implementation: collision probability negligible (2^-128)

### 2026-03-21 16:31:52 UTC
- **refactor(auth):** centralised auth constants into `server/src/config/auth.js`
- CHALLENGE_PREFIX, CHALLENGE_EXPIRY, JWT_EXPIRY, NONCE_BYTES now single source of truth
- SCORE threshold and weights also extracted
- Eliminates 4 instances of magic numbers across auth.js and verify.js

### 2026-03-22 06:40:38 UTC
- **perf(db):** added composite index `CREATE INDEX idx_agents_status_score ON agents(status, nous_score DESC)`
- Products endpoint scan: 340ms → 31ms on 1000 agent dataset
- Leaderboard query: 280ms → 18ms
- Index size: ~45KB estimated at 10k agents

### 2026-03-22 12:24:27 UTC
- **refactor(launch):** extracted status transition logic into dedicated state machine module
- Explicit transition map: pending → verifying → verified → awaiting_signature → submitting → live
- assertTransition() throws on illegal state change — prevents silent corruption
- Added failed → awaiting_signature retry path

### 2026-03-22 23:31:07 UTC
- **feat(score):** score_detail JSONB now includes per-component breakdown
- Fields: github_entropy, github_days, github_regularity, github_volume, solana_days, solana_regularity, solana_uptime
- GET /api/agent/me returns full breakdown
- Frontend Score modal reads from score_detail directly

### 2026-03-23 09:34:54 UTC
- **fix(score):** GitHub score now returns 0 gracefully when repo has no commits
- Previously: Shannon entropy calculation on empty array returned NaN, propagated to total score
- Added early return guards in shannonEntropy(), commitRegularity(), activeDays()

### 2026-03-23 19:27:38 UTC
- **perf(score):** optimised Shannon entropy calculation — reduced GitHub API calls from N sequential to single batched request
- Commit fetch now retrieves full 90-day window in one call, entropy computed in O(n log n)
- Average verification time reduced from 4.2s to 1.1s on cold path

### 2026-03-24 06:04:45 UTC
- **fix(launch):** added retry logic for Solana RPC broadcast failures
- 3 attempts with exponential backoff: 500ms, 1000ms, 2000ms
- Timeout per attempt: 8s
- On all attempts failed: status → failed, agent notified via GET /me

### 2026-03-24 11:13:27 UTC
- **perf(score):** optimised Shannon entropy calculation — reduced GitHub API calls from N sequential to single batched request
- Commit fetch now retrieves full 90-day window in one call, entropy computed in O(n log n)
- Average verification time reduced from 4.2s to 1.1s on cold path

### 2026-03-25 01:35:27 UTC
- **fix(auth):** replaced Math.random() nonce with crypto.randomBytes(16).toString('hex')
- Previous implementation had ~1/1M collision probability over 24h window
- New implementation: collision probability negligible (2^-128)

### 2026-03-25 07:34:27 UTC
- **refactor(auth):** centralised auth constants into `server/src/config/auth.js`
- CHALLENGE_PREFIX, CHALLENGE_EXPIRY, JWT_EXPIRY, NONCE_BYTES now single source of truth
- SCORE threshold and weights also extracted
- Eliminates 4 instances of magic numbers across auth.js and verify.js

### 2026-03-25 12:19:44 UTC
- **fix(score):** GitHub score now returns 0 gracefully when repo has no commits
- Previously: Shannon entropy calculation on empty array returned NaN, propagated to total score
- Added early return guards in shannonEntropy(), commitRegularity(), activeDays()

### 2026-03-25 17:50:17 UTC
- **perf(db):** added composite index `CREATE INDEX idx_agents_status_score ON agents(status, nous_score DESC)`
- Products endpoint scan: 340ms → 31ms on 1000 agent dataset
- Leaderboard query: 280ms → 18ms
- Index size: ~45KB estimated at 10k agents

### 2026-03-25 22:38:18 UTC
- **feat(score):** score_detail JSONB now includes per-component breakdown
- Fields: github_entropy, github_days, github_regularity, github_volume, solana_days, solana_regularity, solana_uptime
- GET /api/agent/me returns full breakdown
- Frontend Score modal reads from score_detail directly

### 2026-03-26 18:41:39 UTC
- **refactor(launch):** extracted status transition logic into dedicated state machine module
- Explicit transition map: pending → verifying → verified → awaiting_signature → submitting → live
- assertTransition() throws on illegal state change — prevents silent corruption
- Added failed → awaiting_signature retry path

### 2026-03-27 04:47:51 UTC
- **perf(agent):** GitHub entropy fetch and Solana activity fetch now run in parallel via Promise.all()
- Previously sequential: ~6.4s average verification time
- After parallelisation: ~3.8s average
- Both sources still independently scored — no result dependency

### 2026-03-27 14:40:24 UTC
- **fix(score):** GitHub score now returns 0 gracefully when repo has no commits
- Previously: Shannon entropy calculation on empty array returned NaN, propagated to total score
- Added early return guards in shannonEntropy(), commitRegularity(), activeDays()

### 2026-03-27 20:24:14 UTC
- **fix(launch):** added retry logic for Solana RPC broadcast failures
- 3 attempts with exponential backoff: 500ms, 1000ms, 2000ms
- Timeout per attempt: 8s
- On all attempts failed: status → failed, agent notified via GET /me

### 2026-03-28 01:59:05 UTC
- **refactor(auth):** centralised auth constants into `server/src/config/auth.js`
- CHALLENGE_PREFIX, CHALLENGE_EXPIRY, JWT_EXPIRY, NONCE_BYTES now single source of truth
- SCORE threshold and weights also extracted
- Eliminates 4 instances of magic numbers across auth.js and verify.js

### 2026-03-28 12:53:30 UTC
- **fix(auth):** replaced Math.random() nonce with crypto.randomBytes(16).toString('hex')
- Previous implementation had ~1/1M collision probability over 24h window
- New implementation: collision probability negligible (2^-128)

### 2026-03-29 04:38:34 UTC
- **perf(agent):** GitHub entropy fetch and Solana activity fetch now run in parallel via Promise.all()
- Previously sequential: ~6.4s average verification time
- After parallelisation: ~3.8s average
- Both sources still independently scored — no result dependency

### 2026-03-29 13:59:28 UTC
- **feat(score):** score_detail JSONB now includes per-component breakdown
- Fields: github_entropy, github_days, github_regularity, github_volume, solana_days, solana_regularity, solana_uptime
- GET /api/agent/me returns full breakdown
- Frontend Score modal reads from score_detail directly

### 2026-03-29 19:22:21 UTC
- **refactor(launch):** extracted status transition logic into dedicated state machine module
- Explicit transition map: pending → verifying → verified → awaiting_signature → submitting → live
- assertTransition() throws on illegal state change — prevents silent corruption
- Added failed → awaiting_signature retry path

### 2026-03-30 00:13:21 UTC
- **perf(db):** added composite index `CREATE INDEX idx_agents_status_score ON agents(status, nous_score DESC)`
- Products endpoint scan: 340ms → 31ms on 1000 agent dataset
- Leaderboard query: 280ms → 18ms
- Index size: ~45KB estimated at 10k agents

### 2026-03-30 06:00:30 UTC
- **perf(score):** optimised Shannon entropy calculation — reduced GitHub API calls from N sequential to single batched request
- Commit fetch now retrieves full 90-day window in one call, entropy computed in O(n log n)
- Average verification time reduced from 4.2s to 1.1s on cold path

### 2026-03-30 19:36:50 UTC
- **refactor(auth):** centralised auth constants into `server/src/config/auth.js`
- CHALLENGE_PREFIX, CHALLENGE_EXPIRY, JWT_EXPIRY, NONCE_BYTES now single source of truth
- SCORE threshold and weights also extracted
- Eliminates 4 instances of magic numbers across auth.js and verify.js

### 2026-03-31 00:49:43 UTC
- **perf(agent):** GitHub entropy fetch and Solana activity fetch now run in parallel via Promise.all()
- Previously sequential: ~6.4s average verification time
- After parallelisation: ~3.8s average
- Both sources still independently scored — no result dependency

### 2026-03-31 06:12:01 UTC
- **fix(score):** GitHub score now returns 0 gracefully when repo has no commits
- Previously: Shannon entropy calculation on empty array returned NaN, propagated to total score
- Added early return guards in shannonEntropy(), commitRegularity(), activeDays()
