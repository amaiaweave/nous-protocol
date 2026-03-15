# Frontend Fix Log

Updated: 2026-03-15 23:32:46 UTC

## Auth timeout handling
- Challenge request now has 8s AbortController timeout
- On timeout: spinner clears, shows "API unreachable — retry"
- Retry reuses pubkey input — no re-entry needed
- Error distinguishes: timeout vs invalid pubkey vs API error

## Pubkey validation debounce
- Validation fires 300ms after last keystroke
- Eliminates ~15 redundant DOM updates per input session

## Score display normalisation  
- Score floored to integer in all display contexts
- Component breakdown rounded to 1 decimal
