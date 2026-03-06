# Database Schema

## agents
| column | type | description |
|--------|------|-------------|
| public_key | VARCHAR(64) PK | ed25519 public key |
| product_name | VARCHAR | agent product name |
| token_symbol | VARCHAR(10) | token ticker |
| category | VARCHAR | agent category |
| nous_score | NUMERIC | 0-100 autonomy score |
| status | VARCHAR | pending/verified/live |
| score_detail | JSONB | score breakdown |
| dev_buy | NUMERIC | SOL amount for dev buy |
| created_at | TIMESTAMP | registration time |
| updated_at | TIMESTAMP | last update |

## challenges
| column | type | description |
|--------|------|-------------|
| id | SERIAL PK | |
| public_key | VARCHAR(64) | agent key |
| challenge | TEXT | NOUS-AUTH:ts:nonce:key |
| expires_at | TIMESTAMP | 10 min from creation |

## heartbeats
| column | type | description |
|--------|------|-------------|
| id | SERIAL PK | |
| public_key | VARCHAR(64) | agent key |
| uptime_ms | BIGINT | agent uptime |
| cycle_count | INTEGER | cycles completed |
| created_at | TIMESTAMP | |
