-- Rollback for migration 0001 — Operational Store.
-- Reverses 0001_init_operational_store.sql cleanly (drops in FK-safe order).
-- Not auto-run by `wrangler d1 migrations apply` (kept outside the scan dir);
-- apply manually: wrangler d1 execute precision-roof-op --file=migrations/rollback/0001_down.sql

DROP TRIGGER IF EXISTS consent_record_immutable;

DROP INDEX IF EXISTS idx_booking_lead;
DROP INDEX IF EXISTS idx_message_log_lead;
DROP INDEX IF EXISTS idx_operator_access_log_lead;
DROP INDEX IF EXISTS idx_lead_pending_speed_to_lead;
DROP INDEX IF EXISTS idx_review_request_status_requested;

DROP TABLE IF EXISTS review_request;
DROP TABLE IF EXISTS operator_access_log;
DROP TABLE IF EXISTS webhook_events;
DROP TABLE IF EXISTS message_log;
DROP TABLE IF EXISTS suppression;
DROP TABLE IF EXISTS booking;
DROP TABLE IF EXISTS consent_record;
DROP TABLE IF EXISTS lead;
