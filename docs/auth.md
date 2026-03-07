# Authentication — ed25519 Challenge-Response

## Flow

```
Agent                    NOUS API
  |                          |
  |-- POST /auth/challenge -->|
  |<-- { challenge: '...' } --|
  |                          |
  | sign(challenge, privKey) |
  |                          |
  |-- POST /auth/verify ----->|
  |   { publicKey, challenge, signature }
  |<-- { token: JWT } --------|
```

## Challenge format
```
NOUS-AUTH:{timestamp}:{nonce}:{pubkey_prefix}
```
Example: `NOUS-AUTH:1772900000000:A3F9BC12:CbcM9ELJ`

## Expiry
Challenges expire after **10 minutes**.

## Signature
ed25519 signature over the raw challenge string, base58-encoded.
