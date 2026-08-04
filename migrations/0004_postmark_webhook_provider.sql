-- Migration 0004 — widen webhook_events.provider to accept 'postmark' (F-013,
-- BUILDPLAN Phase 09 Task 3, spec §5.5 email bounce/complaint handling).
-- Classification: ADDITIVE in effect (no data loss) but SQLite has no
-- `ALTER TABLE ... ALTER COLUMN`, so a CHECK-constraint change requires the
-- standard rebuild: new table, copy rows, drop old, rename. No indexes exist
-- on webhook_events (0001) to recreate. Same pattern as migration 0003.
-- Target: Cloudflare D1 / SQLite. Rollback: migrations/rollback/0004_down.sql

PRAGMA foreign_keys = OFF;

CREATE TABLE webhook_events_new (
  idempotency_key TEXT PRIMARY KEY,
  provider        TEXT NOT NULL CHECK (provider IN ('twilio','calcom','sanity_job','sanity_publish','callrail','postmark')),
  event_type      TEXT,
  received_at     INTEGER NOT NULL,
  processed_at    INTEGER,
  payload         TEXT
);

INSERT INTO webhook_events_new SELECT * FROM webhook_events;

DROP TABLE webhook_events;
ALTER TABLE webhook_events_new RENAME TO webhook_events;

PRAGMA foreign_keys = ON;
