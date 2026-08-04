import type { SqlExecutor } from './executor';

// Typed data-access layer over the operational store (spec §2.5). Repositories
// hold the SQL; callers pass explicit ids/timestamps (epoch-ms) so behaviour is
// deterministic and testable. The concurrency *authority* is the Durable Object
// (Phase 05b); these methods are the evidence/persistence layer it drives.

export type Channel = 'sms' | 'email';

// ─── lead ────────────────────────────────────────────────────────────────────
export interface LeadInput {
  id: string;
  createdAt: number;
  name: string;
  phoneE164: string;
  email?: string | null;
  zip: string;
  service: string;
  town?: string | null;
  status?: string;
  channel?: 'sms' | 'callback' | null;
  advertisingStatus?: 'active' | 'informational_only';
  smsSuppressedReason?: 'turnstile_fallback' | 'east_end_gate' | 'opt_out' | null;
  gaClientId?: string | null;
  consentVersion?: string | null;
  consentIp?: string | null;
  consentUa?: string | null;
  consentSourceUrl?: string | null;
  consentTimestamp?: number | null;
}

export interface LeadRow {
  id: string;
  created_at: number;
  updated_at: number;
  name: string;
  phone_e164: string;
  email: string | null;
  zip: string;
  service: string;
  town: string | null;
  status: string;
  channel: string | null;
  advertising_status: string;
  sms_suppressed_reason: string | null;
  sms_claimed_at: number | null;
  speed_to_lead_sms_sent_at: number | null;
  ga_client_id: string | null;
  consent_version: string | null;
  consent_ip: string | null;
  consent_ua: string | null;
  consent_source_url: string | null;
  consent_timestamp: number | null;
}

export function leadRepo(db: SqlExecutor) {
  return {
    async insert(l: LeadInput): Promise<void> {
      await db.run(
        `INSERT INTO lead (id, created_at, updated_at, name, phone_e164, email, zip, service, town,
           status, channel, advertising_status, sms_suppressed_reason, ga_client_id,
           consent_version, consent_ip, consent_ua, consent_source_url, consent_timestamp)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          l.id, l.createdAt, l.createdAt, l.name, l.phoneE164, l.email ?? null, l.zip, l.service, l.town ?? null,
          l.status ?? 'new', l.channel ?? null, l.advertisingStatus ?? 'active', l.smsSuppressedReason ?? null, l.gaClientId ?? null,
          l.consentVersion ?? null, l.consentIp ?? null, l.consentUa ?? null, l.consentSourceUrl ?? null, l.consentTimestamp ?? null,
        ],
      );
    },

    getById(id: string): Promise<LeadRow | undefined> {
      return db.get<LeadRow>(`SELECT * FROM lead WHERE id = ?`, [id]);
    },

    /** Leads in a given status, newest first — powers the failed-send queue. */
    listByStatus(status: string): Promise<LeadRow[]> {
      return db.all<LeadRow>(`SELECT * FROM lead WHERE status = ? ORDER BY created_at DESC`, [status]);
    },

    /**
     * `cron: slo-sweep` scope (spec §3.2): active, not permanently SMS-suppressed
     * (turnstile_fallback / east_end_gate / opt_out), and never claimed for
     * speed-to-lead SMS — i.e. leads whose original DO reservation was denied
     * for a transient reason (per-phone window / budget anomaly) or whose queue
     * dispatch never completed. Oldest first so the sweep drains the backlog.
     */
    listEligibleForSweep(): Promise<LeadRow[]> {
      return db.all<LeadRow>(
        `SELECT * FROM lead
           WHERE advertising_status = 'active' AND sms_suppressed_reason IS NULL AND sms_claimed_at IS NULL
         ORDER BY created_at ASC`,
      );
    },

    async setStatus(id: string, status: string, now: number): Promise<number> {
      return (await db.run(`UPDATE lead SET status = ?, updated_at = ? WHERE id = ?`, [status, now, id])).changes;
    },

    async setChannel(id: string, channel: 'sms' | 'callback', now: number): Promise<number> {
      return (await db.run(`UPDATE lead SET channel = ?, updated_at = ? WHERE id = ?`, [channel, now, id])).changes;
    },

    /**
     * Atomically claim this lead for a single outbound speed-to-lead SMS.
     * Returns true exactly once: subsequent calls (or a racing sweep) see
     * sms_claimed_at set and get false. Also refuses suppressed / non-advertising
     * leads (spec §3.1 send-time claim).
     */
    async claimForSms(id: string, now: number): Promise<boolean> {
      const r = await db.run(
        `UPDATE lead SET sms_claimed_at = ?, updated_at = ?
         WHERE id = ? AND sms_claimed_at IS NULL
           AND sms_suppressed_reason IS NULL AND advertising_status = 'active'`,
        [now, now, id],
      );
      return r.changes === 1;
    },

    async markSpeedToLeadSent(id: string, sentAt: number): Promise<void> {
      await db.run(
        `UPDATE lead SET speed_to_lead_sms_sent_at = ?, status = 'sms_sent', updated_at = ? WHERE id = ?`,
        [sentAt, sentAt, id],
      );
    },

    /**
     * Scrub the PII consent columns (ip/ua/source-url) past the 24-mo purge
     * window (spec §2.5: "may be scrubbed from lead at 24-mo"). The full
     * consent record already survives independently in `consent_record`
     * (4-yr retention) — `consent_version`/`consent_timestamp` stay on `lead`
     * since neither is personally identifying on its own. Returns rows changed.
     */
    async scrubConsentColumns(cutoffCreatedAt: number): Promise<number> {
      const r = await db.run(
        `UPDATE lead SET consent_ip = NULL, consent_ua = NULL, consent_source_url = NULL
         WHERE created_at < ? AND (consent_ip IS NOT NULL OR consent_ua IS NOT NULL OR consent_source_url IS NOT NULL)`,
        [cutoffCreatedAt],
      );
      return r.changes;
    },
  };
}

// ─── suppression ── (channel, contact) opt-out ledger [C2-007, SPEC-006] ─────
export function suppressionRepo(db: SqlExecutor) {
  return {
    /** A contact is suppressed unless a later opt-in (START) supersedes the STOP. */
    async isSuppressed(channel: Channel, contact: string): Promise<boolean> {
      const row = await db.get<{ suppressed_at: number; opted_in_at: number | null }>(
        `SELECT suppressed_at, opted_in_at FROM suppression WHERE channel = ? AND contact = ?`,
        [channel, contact],
      );
      if (!row) return false;
      return row.opted_in_at === null || row.opted_in_at < row.suppressed_at;
    },

    /** STOP: suppress wholesale and clear any prior opt-in. */
    async suppress(channel: Channel, contact: string, now: number, keyword: string | null = null): Promise<void> {
      await db.run(
        `INSERT INTO suppression (channel, contact, suppressed_at, opted_in_at, keyword_matched)
         VALUES (?,?,?,NULL,?)
         ON CONFLICT(channel, contact)
           DO UPDATE SET suppressed_at = excluded.suppressed_at, opted_in_at = NULL, keyword_matched = excluded.keyword_matched`,
        [channel, contact, now, keyword],
      );
    },

    /** START/resubscribe: supersede the suppression rather than hard-deleting it. */
    async optIn(channel: Channel, contact: string, now: number): Promise<void> {
      await db.run(`UPDATE suppression SET opted_in_at = ? WHERE channel = ? AND contact = ?`, [now, channel, contact]);
    },
  };
}

// ─── webhook_events ── idempotency ledger [C2-002] ───────────────────────────
export type WebhookProvider = 'twilio' | 'calcom' | 'sanity_job' | 'sanity_publish' | 'callrail';

export function webhookEventsRepo(db: SqlExecutor) {
  return {
    /**
     * Claim a webhook by idempotency key (e.g. "MessageSid:MessageStatus").
     * Returns true on the first delivery (caller should process it) and false
     * for every redelivery (caller must skip side effects).
     */
    async claim(
      key: string,
      provider: WebhookProvider,
      receivedAt: number,
      eventType: string | null = null,
      payload: string | null = null,
    ): Promise<boolean> {
      const r = await db.run(
        `INSERT OR IGNORE INTO webhook_events (idempotency_key, provider, event_type, received_at, payload)
         VALUES (?,?,?,?,?)`,
        [key, provider, eventType, receivedAt, payload],
      );
      return r.changes === 1;
    },

    async markProcessed(key: string, now: number): Promise<void> {
      await db.run(`UPDATE webhook_events SET processed_at = ? WHERE idempotency_key = ?`, [now, key]);
    },

    /** Prune rows past the provider retry window (spec §8, C2-024). Returns rows deleted. */
    async pruneOlderThan(cutoff: number): Promise<number> {
      return (await db.run(`DELETE FROM webhook_events WHERE received_at < ?`, [cutoff])).changes;
    },
  };
}

// ─── consent_record ── append-only 4-yr TCPA evidence [SPEC-008] ─────────────
export interface ConsentInput {
  id: string;
  phoneE164: string;
  consentText: string;
  consentVersion: string;
  consentTimestamp: number;
  consentIp?: string | null;
  consentUa?: string | null;
  consentSourceUrl?: string | null;
  leadId?: string | null;
}

export function consentRepo(db: SqlExecutor) {
  return {
    async append(c: ConsentInput): Promise<void> {
      await db.run(
        `INSERT INTO consent_record (id, phone_e164, consent_text, consent_version, consent_timestamp,
           consent_ip, consent_ua, consent_source_url, lead_id)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [c.id, c.phoneE164, c.consentText, c.consentVersion, c.consentTimestamp,
          c.consentIp ?? null, c.consentUa ?? null, c.consentSourceUrl ?? null, c.leadId ?? null],
      );
    },

    /**
     * Delete rows past the 4-year TCPA statute-of-limitations retention
     * (spec §2.5). The append-only trigger on this table blocks UPDATE, not
     * DELETE — the migration's own comment names this purge as the one
     * permitted delete. Returns rows deleted.
     */
    async purgeOlderThan(cutoff: number): Promise<number> {
      return (await db.run(`DELETE FROM consent_record WHERE consent_timestamp < ?`, [cutoff])).changes;
    },
  };
}

// ─── message_log ── monotonic last-write-wins status [C2-002, C2-025] ────────
export interface MessageLogInput {
  id: string;
  leadId?: string | null;
  channel: Channel;
  providerMessageId?: string | null;
  status: string;
  statusRank?: number;
  toContact?: string | null;
  createdAt: number;
}

export function messageLogRepo(db: SqlExecutor) {
  return {
    async insert(m: MessageLogInput): Promise<void> {
      await db.run(
        `INSERT INTO message_log (id, lead_id, channel, provider_message_id, status, status_rank, to_contact, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [m.id, m.leadId ?? null, m.channel, m.providerMessageId ?? null, m.status, m.statusRank ?? 0, m.toContact ?? null, m.createdAt, m.createdAt],
      );
    },

    /**
     * Advance a message's status only if the new rank is strictly higher —
     * out-of-order provider callbacks (queued after delivered) are ignored.
     * Returns true when the update applied.
     */
    async advanceStatus(
      providerMessageId: string,
      status: string,
      rank: number,
      now: number,
      twilioErrorCode: number | null = null,
    ): Promise<boolean> {
      const r = await db.run(
        `UPDATE message_log
           SET status = ?, status_rank = ?, twilio_error_code = COALESCE(?, twilio_error_code), updated_at = ?
         WHERE provider_message_id = ? AND status_rank < ?`,
        [status, rank, twilioErrorCode, now, providerMessageId, rank],
      );
      return r.changes === 1;
    },

    getByProviderId(providerMessageId: string): Promise<{ status: string; status_rank: number } | undefined> {
      return db.get(`SELECT status, status_rank FROM message_log WHERE provider_message_id = ?`, [providerMessageId]);
    },

    /**
     * Anonymize (not delete — delivery-status history stays useful for
     * reporting) the PII contact column past the TCPA retention window
     * (spec §8, C2-024). Returns rows changed.
     */
    async anonymizeOlderThan(cutoff: number): Promise<number> {
      const r = await db.run(
        `UPDATE message_log SET to_contact = NULL WHERE created_at < ? AND to_contact IS NOT NULL`,
        [cutoff],
      );
      return r.changes;
    },
  };
}

// ─── booking ── Cal.com [C2-005] ─────────────────────────────────────────────
export interface BookingInput {
  id: string;
  leadId?: string | null;
  calcomBookingUid: string;
  slotStart: number;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  status: string;
  source: 'form' | 'booking_direct';
  createdAt: number;
}

export function bookingRepo(db: SqlExecutor) {
  return {
    /** Idempotent by Cal.com uid: a redelivered webhook updates, never duplicates. */
    async upsertByUid(b: BookingInput): Promise<void> {
      await db.run(
        `INSERT INTO booking (id, lead_id, calcom_booking_uid, slot_start, name, phone, email, status, source, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(calcom_booking_uid)
           DO UPDATE SET status = excluded.status, slot_start = excluded.slot_start,
                         lead_id = COALESCE(excluded.lead_id, booking.lead_id)`,
        [b.id, b.leadId ?? null, b.calcomBookingUid, b.slotStart, b.name ?? null, b.phone ?? null, b.email ?? null, b.status, b.source, b.createdAt],
      );
    },

    getByUid(uid: string): Promise<{ id: string; status: string; lead_id: string | null } | undefined> {
      return db.get(`SELECT id, status, lead_id FROM booking WHERE calcom_booking_uid = ?`, [uid]);
    },
  };
}

// ─── review_request ── F-013 (Phase 2 engine) ────────────────────────────────
export interface ReviewRequestInput {
  id: string;
  jobId: string;
  customerContact: string;
  channel: Channel;
  requestedAt: number;
}

/** `customer_contact` is NOT NULL, so anonymization writes this sentinel rather than NULL. */
export const REDACTED_CONTACT = '[redacted]';

export interface ReviewRequestRow {
  id: string;
  job_id: string;
  customer_contact: string;
  channel: Channel;
}

export function reviewRequestRepo(db: SqlExecutor) {
  return {
    async createPending(r: ReviewRequestInput): Promise<void> {
      await db.run(
        `INSERT INTO review_request (id, job_id, customer_contact, channel, status, requested_at)
         VALUES (?,?,?,?, 'pending', ?)`,
        [r.id, r.jobId, r.customerContact, r.channel, r.requestedAt],
      );
    },

    /** Send-once: transitions pending → sent and returns true only on that edge. */
    async markSent(id: string, now: number): Promise<boolean> {
      const r = await db.run(
        `UPDATE review_request SET status = 'sent', sent_at = ? WHERE id = ? AND status = 'pending'`,
        [now, id],
      );
      return r.changes === 1;
    },

    /** Suppressed contact: transitions pending → suppressed, never sent. */
    async markSuppressed(id: string): Promise<boolean> {
      const r = await db.run(
        `UPDATE review_request SET status = 'suppressed' WHERE id = ? AND status = 'pending'`,
        [id],
      );
      return r.changes === 1;
    },

    /** Permanent send failure (no retry — matches message_log's failed_permanent). */
    async markFailed(id: string): Promise<boolean> {
      const r = await db.run(
        `UPDATE review_request SET status = 'failed' WHERE id = ? AND status = 'pending'`,
        [id],
      );
      return r.changes === 1;
    },

    /** Rows the cron sweep still owes an ask. Oldest first (fairness). */
    listPending(limit: number): Promise<ReviewRequestRow[]> {
      return db.all<ReviewRequestRow>(
        `SELECT id, job_id, customer_contact, channel FROM review_request
         WHERE status = 'pending' ORDER BY requested_at ASC LIMIT ?`,
        [limit],
      );
    },

    /** Anonymize the PII contact column past retention (spec §8, C2-031). Returns rows changed. */
    async anonymizeOlderThan(cutoff: number): Promise<number> {
      const r = await db.run(
        `UPDATE review_request SET customer_contact = ? WHERE requested_at < ? AND customer_contact != ?`,
        [REDACTED_CONTACT, cutoff, REDACTED_CONTACT],
      );
      return r.changes;
    },
  };
}

// ─── operator_access_log ── PII read audit [C2-027] ──────────────────────────
export interface AccessLogInput {
  id: string;
  operatorId: string;
  action: string;
  leadId?: string | null;
  accessedAt: number;
  ip?: string | null;
}

export function operatorAccessLogRepo(db: SqlExecutor) {
  return {
    async log(a: AccessLogInput): Promise<void> {
      await db.run(
        `INSERT INTO operator_access_log (id, operator_id, action, lead_id, accessed_at, ip)
         VALUES (?,?,?,?,?,?)`,
        [a.id, a.operatorId, a.action, a.leadId ?? null, a.accessedAt, a.ip ?? null],
      );
    },
  };
}

// ─── resend_token ── single-use operator resend-link ledger [F-023] ──────────
export function resendTokenRepo(db: SqlExecutor) {
  return {
    /**
     * Claim a resend token by its jti. Returns true exactly once (first use):
     * a replayed token sees the row already present and gets false. Atomic via
     * INSERT OR IGNORE, mirroring webhook_events.claim — this is what makes the
     * emailed resend link single-use (spec §7.1).
     */
    async claim(jti: string, leadId: string | null, now: number): Promise<boolean> {
      const r = await db.run(
        `INSERT OR IGNORE INTO resend_token (jti, lead_id, consumed_at) VALUES (?,?,?)`,
        [jti, leadId, now],
      );
      return r.changes === 1;
    },
  };
}

// ─── aggregator ──────────────────────────────────────────────────────────────
export function createRepositories(db: SqlExecutor) {
  return {
    lead: leadRepo(db),
    suppression: suppressionRepo(db),
    webhookEvents: webhookEventsRepo(db),
    consent: consentRepo(db),
    messageLog: messageLogRepo(db),
    booking: bookingRepo(db),
    reviewRequest: reviewRequestRepo(db),
    operatorAccessLog: operatorAccessLogRepo(db),
    resendToken: resendTokenRepo(db),
  };
}
