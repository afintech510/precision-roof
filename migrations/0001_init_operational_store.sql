-- Migration 0001 — Operational Store (initial schema).
-- Classification: ADDITIVE (creates new tables/indexes; no destructive change).
-- Target: Cloudflare D1 / SQLite. Conventions (spec §2.5, [C2-013]):
--   • ids: TEXT           • timestamps: INTEGER (epoch-ms)
--   • booleans: INTEGER 0/1   • enums: TEXT + CHECK
--   • NO timestamptz / uuid / boolean / serial / jsonb anywhere.
-- Rollback: migrations/rollback/0001_down.sql

PRAGMA foreign_keys = ON;

-- ── lead ── F-012, F-009 ─────────────────────────────────────────────────────
-- status transition map (enforced in the app layer; value set enforced by CHECK):
--   new → sms_sent → booked
--   new → informational_only (East-End gate / turnstile fallback)
--   sms_sent → failed_followup → closed ; any → closed
CREATE TABLE lead (
  id                        TEXT PRIMARY KEY,
  created_at                INTEGER NOT NULL,
  updated_at                INTEGER NOT NULL,
  name                      TEXT NOT NULL,
  phone_e164                TEXT NOT NULL,
  email                     TEXT,
  zip                       TEXT NOT NULL,
  service                   TEXT NOT NULL,
  town                      TEXT,
  status                    TEXT NOT NULL DEFAULT 'new'
                              CHECK (status IN ('new','sms_sent','booked','informational_only','failed_followup','closed')),
  channel                   TEXT CHECK (channel IN ('sms','callback')),
  advertising_status        TEXT NOT NULL DEFAULT 'active'
                              CHECK (advertising_status IN ('active','informational_only')),
  sms_suppressed_reason     TEXT CHECK (sms_suppressed_reason IN ('turnstile_fallback','east_end_gate','opt_out')),
  sms_claimed_at            INTEGER,
  speed_to_lead_sms_sent_at INTEGER,
  ga_client_id              TEXT,
  consent_version           TEXT,
  consent_ip                TEXT,
  consent_ua                TEXT,
  consent_source_url        TEXT,
  consent_timestamp         INTEGER
);

-- ── consent_record ── append-only, 4-year TCPA retention [C2-006, SPEC-008] ──
-- Rows are immutable (no UPDATE); DELETE is permitted only for the Phase-08
-- 4-year retention purge.
CREATE TABLE consent_record (
  id                 TEXT PRIMARY KEY,
  phone_e164         TEXT NOT NULL,
  consent_text       TEXT NOT NULL,
  consent_version    TEXT NOT NULL,
  consent_timestamp  INTEGER NOT NULL,
  consent_ip         TEXT,
  consent_ua         TEXT,
  consent_source_url TEXT,
  lead_id            TEXT REFERENCES lead(id)
);
CREATE TRIGGER consent_record_immutable
BEFORE UPDATE ON consent_record
BEGIN
  SELECT RAISE(ABORT, 'consent_record is append-only');
END;

-- ── booking ── F-008 [C2-005] ────────────────────────────────────────────────
CREATE TABLE booking (
  id                 TEXT PRIMARY KEY,
  lead_id            TEXT REFERENCES lead(id),
  calcom_booking_uid TEXT NOT NULL UNIQUE,
  slot_start         INTEGER NOT NULL,
  name               TEXT,
  phone              TEXT,
  email              TEXT,
  status             TEXT NOT NULL,
  source             TEXT NOT NULL CHECK (source IN ('form','booking_direct')),
  created_at         INTEGER NOT NULL
);

-- ── suppression ── (channel, contact) PK [C2-007, SPEC-006] ──────────────────
-- opted_in_at nullable: START/resubscribe supersedes rather than hard-deletes.
CREATE TABLE suppression (
  channel         TEXT NOT NULL CHECK (channel IN ('sms','email')),
  contact         TEXT NOT NULL,
  suppressed_at   INTEGER NOT NULL,
  opted_in_at     INTEGER,
  keyword_matched TEXT,
  PRIMARY KEY (channel, contact)
);

-- ── message_log ── monotonic last-write-wins state machine [C2-002, C2-025] ──
CREATE TABLE message_log (
  id                  TEXT PRIMARY KEY,
  lead_id             TEXT REFERENCES lead(id),
  channel             TEXT NOT NULL CHECK (channel IN ('sms','email')),
  provider_message_id TEXT UNIQUE,
  status              TEXT NOT NULL,
  status_rank         INTEGER NOT NULL DEFAULT 0,
  twilio_error_code   INTEGER,
  bounce_status       TEXT,
  to_contact          TEXT,
  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL
);

-- ── webhook_events ── idempotency ledger [C2-002, C2-023] ────────────────────
-- idempotency_key holds e.g. "<MessageSid>:<MessageStatus>" (Twilio status),
-- "<MessageSid>" (inbound), "<calcomUid>:<trigger>" (Cal.com),
-- "<sanityRev>" (sanity-publish). Pruned past provider retry window in Phase 08.
CREATE TABLE webhook_events (
  idempotency_key TEXT PRIMARY KEY,
  provider        TEXT NOT NULL CHECK (provider IN ('twilio','calcom','sanity_job','sanity_publish')),
  event_type      TEXT,
  received_at     INTEGER NOT NULL,
  processed_at    INTEGER,
  payload         TEXT
);

-- ── operator_access_log ── one row per dashboard read of lead PII [C2-027] ───
CREATE TABLE operator_access_log (
  id          TEXT PRIMARY KEY,
  operator_id TEXT NOT NULL,
  action      TEXT NOT NULL,
  lead_id     TEXT,
  accessed_at INTEGER NOT NULL,
  ip          TEXT
);

-- ── review_request ── F-013 (Phase 2 engine writes here) ─────────────────────
CREATE TABLE review_request (
  id               TEXT PRIMARY KEY,
  job_id           TEXT NOT NULL,
  customer_contact TEXT NOT NULL,
  channel          TEXT NOT NULL CHECK (channel IN ('sms','email')),
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','sent','failed','suppressed')),
  requested_at     INTEGER NOT NULL,
  sent_at          INTEGER
);

-- ── Indexes [C2-025] ─────────────────────────────────────────────────────────
-- (UNIQUE on message_log.provider_message_id, booking.calcom_booking_uid, and the
--  suppression composite PK are created inline above.)
CREATE INDEX idx_review_request_status_requested ON review_request(status, requested_at);
CREATE INDEX idx_lead_pending_speed_to_lead      ON lead(created_at) WHERE speed_to_lead_sms_sent_at IS NULL;
CREATE INDEX idx_operator_access_log_lead        ON operator_access_log(lead_id);
CREATE INDEX idx_message_log_lead                ON message_log(lead_id);
CREATE INDEX idx_booking_lead                    ON booking(lead_id);
