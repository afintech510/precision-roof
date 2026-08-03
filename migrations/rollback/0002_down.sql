-- Rollback for migration 0002 — Operator resend-token single-use ledger.
-- Reverses 0002_operator_resend_tokens.sql.
-- Not auto-run by `wrangler d1 migrations apply` (kept outside the scan dir);
-- apply manually: wrangler d1 execute precision-roof-op --file=migrations/rollback/0002_down.sql

DROP TABLE IF EXISTS resend_token;
