-- Migration 0002 — Operator resend-token single-use ledger (F-023, spec §7.1).
-- Classification: ADDITIVE (creates one new table; no destructive change).
-- Target: Cloudflare D1 / SQLite. Same conventions as 0001 (spec §2.5, [C2-013]):
--   • ids: TEXT   • timestamps: INTEGER (epoch-ms)   • enums: TEXT + CHECK
-- Rollback: migrations/rollback/0002_down.sql
--
-- The emailed failed-send resend link executes only as an authenticated POST
-- carrying a short-TTL HMAC-signed token. Signature + expiry are verified
-- statelessly; SINGLE USE is enforced here: the token's jti is claimed exactly
-- once (INSERT OR IGNORE → changes=1 on first use), so a replayed token is
-- rejected. Mirrors the webhook_events idempotency-claim pattern [C2-002].

PRAGMA foreign_keys = ON;

CREATE TABLE resend_token (
  jti         TEXT PRIMARY KEY,   -- unique token id embedded in the signed token
  lead_id     TEXT REFERENCES lead(id),
  consumed_at INTEGER NOT NULL    -- epoch-ms the token was first (and only) used
);
