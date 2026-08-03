import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { SqlExecutor, SqlParam } from '../db/executor';
import { createRepositories } from '../db/repositories';
import { dispatchSmsFromQueue, type SmsAuthorityStub, type SmsDispatchMessage } from './sms-dispatch';
import type { TwilioSendResult } from './twilio-send';

const MIG_DIR = join(process.cwd(), 'migrations');
const MIGRATIONS = readdirSync(MIG_DIR)
  .filter((f) => /^\d+_.*\.sql$/.test(f))
  .sort()
  .map((f) => readFileSync(join(MIG_DIR, f), 'utf8'));

function nodeExecutor(db: InstanceType<typeof DatabaseSync>): SqlExecutor {
  return {
    async run(sql: string, params: SqlParam[] = []) { return { changes: Number(db.prepare(sql).run(...params).changes) }; },
    async get<T>(sql: string, params: SqlParam[] = []) { const r = db.prepare(sql).get(...params); return r === undefined ? undefined : (r as T); },
    async all<T>(sql: string, params: SqlParam[] = []) { return db.prepare(sql).all(...params) as T[]; },
  };
}

let db: InstanceType<typeof DatabaseSync>;
let repos: ReturnType<typeof createRepositories>;
let ids: number;
const deps = (overrides: Partial<{ sendSms: (to: string, body: string) => Promise<TwilioSendResult> }> = {}) => ({
  now: 10_000,
  newId: () => `id-${++ids}`,
  sendSms: overrides.sendSms ?? (async (): Promise<TwilioSendResult> => ({ ok: true, messageSid: 'SM123' })),
});

function allowAuthority(): SmsAuthorityStub {
  return {
    reserve: async () => ({ allow: true, token: 'tok-1' }),
    claimSend: async () => ({ allow: true }),
  };
}

const msg = (over: Partial<SmsDispatchMessage> = {}): SmsDispatchMessage => ({
  leadId: 'lead-1', phoneE164: '+15165550100', body: 'We got your request!', allowToken: 'tok-1', ...over,
});

beforeEach(async () => {
  db = new DatabaseSync(':memory:');
  for (const m of MIGRATIONS) db.exec(m);
  repos = createRepositories(nodeExecutor(db));
  ids = 0;
  await repos.lead.insert({
    id: 'lead-1', createdAt: 1, name: 'Pat Doe', phoneE164: '+15165550100',
    zip: '11743', service: 'roof-repair',
  });
});

describe('dispatchSmsFromQueue', () => {
  it('sends, records message_log, and marks the lead sms_sent on the happy path', async () => {
    const res = await dispatchSmsFromQueue(msg(), repos, allowAuthority(), deps());
    expect(res).toEqual({ dispatched: true, messageSid: 'SM123' });
    const lead = await repos.lead.getById('lead-1');
    expect(lead?.status).toBe('sms_sent');
    expect(lead?.speed_to_lead_sms_sent_at).toBe(10_000);
    const log = db.prepare('SELECT status, provider_message_id FROM message_log').get() as { status: string; provider_message_id: string };
    expect(log).toEqual({ status: 'queued', provider_message_id: 'SM123' });
  });

  it('is not dispatched when the DO authority denies the claim (e.g. STOP arrived first)', async () => {
    const authority: SmsAuthorityStub = { reserve: async () => ({ allow: true, token: 't' }), claimSend: async () => ({ allow: false, reason: 'suppressed' }) };
    const res = await dispatchSmsFromQueue(msg(), repos, authority, deps());
    expect(res).toEqual({ dispatched: false, reason: 'suppressed' });
    const lead = await repos.lead.getById('lead-1');
    expect(lead?.status).toBe('new'); // untouched — never reached the D1 claim
    expect(db.prepare('SELECT COUNT(*) AS n FROM message_log').get()).toEqual({ n: 0 });
  });

  it('a redelivered queue message is a no-op the second time (D1 idempotency claim)', async () => {
    const first = await dispatchSmsFromQueue(msg(), repos, allowAuthority(), deps());
    expect(first.dispatched).toBe(true);
    const second = await dispatchSmsFromQueue(msg(), repos, allowAuthority(), deps());
    expect(second).toEqual({ dispatched: false, reason: 'already_claimed' });
    expect(db.prepare('SELECT COUNT(*) AS n FROM message_log').get()).toEqual({ n: 1 });
  });

  it('records failed_permanent and flips the lead to failed_followup on a send failure', async () => {
    const failing = deps({ sendSms: async () => ({ ok: false, message: 'carrier rejected' }) });
    const res = await dispatchSmsFromQueue(msg(), repos, allowAuthority(), failing);
    expect(res).toEqual({ dispatched: false, reason: 'send_failed' });
    const lead = await repos.lead.getById('lead-1');
    expect(lead?.status).toBe('failed_followup');
    const log = db.prepare('SELECT status FROM message_log').get() as { status: string };
    expect(log.status).toBe('failed_permanent');
  });

  it('never blocks on a hanging Twilio call being awaited elsewhere (dispatch is a plain async fn, not inline in the request path)', async () => {
    let resolveHang: (() => void) | undefined;
    let sendSmsCalled: (() => void) | undefined;
    const called = new Promise<void>((resolve) => { sendSmsCalled = resolve; });
    const hangingDeps = deps({
      sendSms: () => {
        sendSmsCalled?.();
        return new Promise((resolve) => { resolveHang = () => resolve({ ok: true, messageSid: 'SM999' }); });
      },
    });
    const pending = dispatchSmsFromQueue(msg(), repos, allowAuthority(), hangingDeps);
    // Wait until the hanging Twilio call has actually started, proving the D1
    // claim already ran without dispatch itself blocking on the send.
    await called;
    const before = await repos.lead.getById('lead-1');
    expect(before?.status).toBe('new');
    resolveHang?.();
    const res = await pending;
    expect(res).toEqual({ dispatched: true, messageSid: 'SM999' });
  });
});
