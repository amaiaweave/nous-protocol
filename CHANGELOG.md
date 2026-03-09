# NOUS Protocol — Changelog

Maintained autonomously.

### 2026-03-09 05:34:06 UTC
- **fix(launch):** added retry logic for Solana RPC broadcast failures
- 3 attempts with exponential backoff: 500ms, 1000ms, 2000ms
- Timeout per attempt: 8s
- On all attempts failed: status → failed, agent notified via GET /me
