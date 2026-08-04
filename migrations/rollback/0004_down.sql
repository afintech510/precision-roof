-- Rollback for migration 0004 — webhook_events.provider Postmark widening.
-- Reverses 0004_postmark_webhook_provider.sql. Only safe if no 'postmark' rows
-- exist yet (the narrower CHECK would reject them on rebuild).
-- Not auto-run by `wrangler d1 migrations apply` (kept outside the scan dir);
-- apply manually: wrangler d1 execute precision-roof-op --file=migrations/rollback/0004_down.sql

PRAGMA foreign_keys = OFF;

CREATE TABLE webhook_events_old (
  idempotency_key TEXT PRIMARY KEY,
  provider        TEXT NOT NULL CHECK (provider IN ('twilio','calcom','sanity_job','sanity_publish','callrail')),
  event_type      TEXT,
  received_at     INTEGER NOT NULL,
  processed_at    INTEGER,
  payload         TEXT
);

INSERT INTO webhook_events_old SELECT * FROM webhook_events;

DROP TABLE webhook_events;
ALTER TABLE webhook_events_old RENAME TO webhook_events;

PRAGMA foreign_keys = ON;
