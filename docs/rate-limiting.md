# Rate Limiting

Implemented: 2026-03-28 18:40:49 UTC

## Policy
- Auth endpoints: 100 requests/min per IP
- Score endpoints: 50 requests/min per IP
- Products (public): 200 requests/min per IP

## Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 94
X-RateLimit-Reset: 1772900060000
```

## Response (429)
```json
{ "error": "rate limit exceeded", "retry_after": 42 }
```
