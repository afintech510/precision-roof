import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SqlExecutor, SqlParam } from './executor';
import { createRepositories } from './repositories';

// Exercise the repositories against real SQLite (the engine D1 runs) by loading
// migration 0001 and driving a node:sqlite-backed executor.

const UP = readFileSync(join(process.cwd(), 'migrations', '0001_init_operational_store.sql'), 'utf8');

function nodeExecutor(db: InstanceType<typeof DatabaseSync>): SqlExecutor {
  return {
    async run(sql: string, params: SqlParam[] = []) {
      const r = db.prepare(sql).run(...params);
      return { changes: Number(r.changes) };
    },
    async get<T>(sql: string, params: SqlParam[] = []) {
      const row = db.prepare(sql).get(...params);
      return (row === undefined ? undefined : (row as T));
    },
    async all<T>(sql: string, params: SqlParam[] = []) {
      return db.prepare(sql).all(...params) as T[];
    },
  };
}

let repos: ReturnType<typeof createRepositories>;

beforeEach(() => {
  const db = new DatabaseSync(':memory:');
  db.exec(UP);
  repos = createRepositories(nodeExecutor(db));
});

describe('webhookEventsRepo — idempotency', () => {
  it('claims a key once; redelivery returns false', async () => {
    const first = await repos.webhookEvents.claim('SM1:delivered', 'twilio', 100);
    const dup = await repos.webhookEvents.claim('SM1:delivered', 'twilio', 101);
    expect(first).toBe(true);
    expect(dup).toBe(false);
  });

  it('treats each status transition as its own key', async () => {
    expect(await repos.webhookEvents.claim('SM1:sent', 'twilio', 100)).toBe(true);
    expect(await repos.webhookEvents.claim('SM1:delivered', 'twilio', 101)).toBe(true);
  });
});

describe('suppressionRepo — opt-out semantics', () => {
  it('suppresses on STOP and clears on START (supersede)', async () => {
    expect(await repos.suppression.isSuppressed('sms', '+15165550100')).toBe(false);
    await repos.suppression.suppress('sms', '+15165550100', 200, 'STOP');
    expect(await repos.suppression.isSuppressed('sms', '+15165550100')).toBe(true);
    await repos.suppression.optIn('sms', '+15165550100', 300);
    expect(await repos.suppression.isSuppressed('sms', '+15165550100')).toBe(false);
  });

  it('re-suppresses after a later STOP even if previously opted in', async () => {
    await repos.suppression.suppress('sms', '+15165550100', 200);
    await repos.suppression.optIn('sms', '+15165550100', 300);
    await repos.suppression.suppress('sms', '+15165550100', 400);
    expect(await repos.suppression.isSuppressed('sms', '+15165550100')).toBe(true);
  });

  it('is channel-scoped', async () => {
    await repos.suppression.suppress('sms', 'x@example.com', 200); // odd but distinct key
    expect(await repos.suppression.isSuppressed('email', 'x@example.com')).toBe(false);
  });
});

describe('leadRepo — atomic SMS claim', () => {
  const base = {
    id: 'l1', createdAt: 1, name: 'A', phoneE164: '+15165550100', zip: '11743', service: 'roof_repair',
  };

  it('claims exactly once across racing callers', async () => {
    await repos.lead.insert(base);
    const a = await repos.lead.claimForSms('l1', 10);
    const b = await repos.lead.claimForSms('l1', 11);
    expect(a).toBe(true);
    expect(b).toBe(false);
  });

  it('refuses to claim a turnstile-fallback (SMS-suppressed) lead', async () => {
    await repos.lead.insert({ ...base, id: 'l2', smsSuppressedReason: 'turnstile_fallback' });
    expect(await repos.lead.claimForSms('l2', 10)).toBe(false);
  });

  it('refuses to claim an informational_only lead', async () => {
    await repos.lead.insert({ ...base, id: 'l3', advertisingStatus: 'informational_only' });
    expect(await repos.lead.claimForSms('l3', 10)).toBe(false);
  });
});

describe('messageLogRepo — monotonic status', () => {
  beforeEach(async () => {
    await repos.messageLog.insert({ id: 'm1', channel: 'sms', providerMessageId: 'SM1', status: 'queued', statusRank: 1, createdAt: 1 });
  });

  it('advances forward but ignores out-of-order (lower-rank) callbacks', async () => {
    expect(await repos.messageLog.advanceStatus('SM1', 'delivered', 3, 10)).toBe(true);
    // a late "sent" (rank 2) after "delivered" (rank 3) must not regress
    expect(await repos.messageLog.advanceStatus('SM1', 'sent', 2, 11)).toBe(false);
  });
});

describe('bookingRepo — idempotent upsert by uid', () => {
  it('updates rather than duplicates on redelivery', async () => {
    await repos.booking.upsertByUid({ id: 'b1', calcomBookingUid: 'CAL9', slotStart: 100, status: 'accepted', source: 'form', createdAt: 1 });
    await repos.booking.upsertByUid({ id: 'b2', calcomBookingUid: 'CAL9', slotStart: 100, status: 'cancelled', source: 'form', createdAt: 2 });
    const row = await repos.booking.getByUid('CAL9');
    expect(row?.id).toBe('b1'); // original row preserved
    expect(row?.status).toBe('cancelled'); // status updated
  });
});

describe('reviewRequestRepo — send once', () => {
  it('transitions pending → sent exactly once', async () => {
    await repos.reviewRequest.createPending({ id: 'r1', jobId: 'job1', customerContact: '+15165550100', channel: 'sms', requestedAt: 1 });
    expect(await repos.reviewRequest.markSent('r1', 10)).toBe(true);
    expect(await repos.reviewRequest.markSent('r1', 11)).toBe(false);
  });

  it('markSuppressed and markFailed are also one-shot CAS from pending', async () => {
    await repos.reviewRequest.createPending({ id: 'r2', jobId: 'job1', customerContact: '+15165550100', channel: 'sms', requestedAt: 1 });
    await repos.reviewRequest.createPending({ id: 'r3', jobId: 'job1', customerContact: 'x@example.com', channel: 'email', requestedAt: 2 });
    expect(await repos.reviewRequest.markSuppressed('r2')).toBe(true);
    expect(await repos.reviewRequest.markSuppressed('r2')).toBe(false); // already suppressed, not pending
    expect(await repos.reviewRequest.markFailed('r3')).toBe(true);
    expect(await repos.reviewRequest.markSent('r3', 10)).toBe(false); // already failed, not pending
  });

  it('listPending returns only pending rows, oldest first', async () => {
    await repos.reviewRequest.createPending({ id: 'r4', jobId: 'job2', customerContact: '+15165550200', channel: 'sms', requestedAt: 20 });
    await repos.reviewRequest.createPending({ id: 'r5', jobId: 'job2', customerContact: '+15165550201', channel: 'sms', requestedAt: 10 });
    await repos.reviewRequest.createPending({ id: 'r6', jobId: 'job2', customerContact: '+15165550202', channel: 'sms', requestedAt: 30 });
    await repos.reviewRequest.markSent('r6', 40);
    const rows = await repos.reviewRequest.listPending(10);
    expect(rows.map((r) => r.id)).toEqual(['r5', 'r4']);
  });
});
