import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import type { SqlExecutor, SqlParam } from '../db/executor';
import {
  SMS_AUTHORITY_SCHEMA,
  reserveSmsSend,
  claimSmsSend,
  setBudgetOverride,
  PHONE_WINDOW_MS,
  type SmsAuthorityDeps,
} from './sms-authority';

function nodeExecutor(db: InstanceType<typeof DatabaseSync>): SqlExecutor {
  return {
    async run(sql: string, params: SqlParam[] = []) { return { changes: Number(db.prepare(sql).run(...params).changes) }; },
    async get<T>(sql: string, params: SqlParam[] = []) { const r = db.prepare(sql).get(...params); return r === undefined ? undefined : (r as T); },
    async all<T>(sql: string, params: SqlParam[] = []) { return db.prepare(sql).all(...params) as T[]; },
  };
}

let db: InstanceType<typeof DatabaseSync>;
let storage: SqlExecutor;
let ids: number;
let suppressed: Set<string>;

const deps = (now: number): SmsAuthorityDeps => ({
  now,
  newId: () => `token-${++ids}`,
  isSuppressed: async (phone) => suppressed.has(phone),
});

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  db.exec(SMS_AUTHORITY_SCHEMA);
  storage = nodeExecutor(db);
  ids = 0;
  suppressed = new Set();
});

describe('reserveSmsSend', () => {
  it('allows a first reservation and issues a token', async () => {
    const r = await reserveSmsSend({ phoneE164: '+15165550100', leadId: 'lead-1' }, storage, deps(1_000));
    expect(r).toEqual({ allow: true, token: 'token-1' });
  });

  it('denies a suppressed phone without touching the window', async () => {
    suppressed.add('+15165550100');
    const r = await reserveSmsSend({ phoneE164: '+15165550100', leadId: 'lead-1' }, storage, deps(1_000));
    expect(r).toEqual({ allow: false, reason: 'suppressed' });
  });

  it('denies a second reservation for the same phone within the 24h window', async () => {
    const first = await reserveSmsSend({ phoneE164: '+15165550100', leadId: 'lead-1' }, storage, deps(1_000));
    expect(first.allow).toBe(true);
    const second = await reserveSmsSend({ phoneE164: '+15165550100', leadId: 'lead-2' }, storage, deps(1_500));
    expect(second).toEqual({ allow: false, reason: 'per_phone_window' });
  });

  it('allows a new reservation once the 24h window has elapsed', async () => {
    await reserveSmsSend({ phoneE164: '+15165550100', leadId: 'lead-1' }, storage, deps(1_000));
    const later = await reserveSmsSend(
      { phoneE164: '+15165550100', leadId: 'lead-2' },
      storage,
      deps(1_000 + PHONE_WINDOW_MS + 1),
    );
    expect(later.allow).toBe(true);
  });

  it('two concurrent same-phone submits (serialized) yield exactly one allow', async () => {
    const [a, b] = [
      await reserveSmsSend({ phoneE164: '+15165550100', leadId: 'lead-1' }, storage, deps(1_000)),
      await reserveSmsSend({ phoneE164: '+15165550100', leadId: 'lead-2' }, storage, deps(1_000)),
    ];
    const allowed = [a, b].filter((r) => r.allow);
    expect(allowed).toHaveLength(1);
  });

  it('operator override "disabled" blocks every reservation', async () => {
    await setBudgetOverride(storage, 'disabled');
    const r = await reserveSmsSend({ phoneE164: '+15165550100', leadId: 'lead-1' }, storage, deps(1_000));
    expect(r).toEqual({ allow: false, reason: 'budget_anomaly' });
  });

  it('trips the anomaly budget on a sudden spike vs an established baseline', async () => {
    // Establish a low baseline: 1 send/minute for 30 minutes, different phones.
    let now: number;
    for (let m = 0; m < 30; m++) {
      now = m * 60_000;
      const r = await reserveSmsSend({ phoneE164: `+1516555${1000 + m}`, leadId: `lead-baseline-${m}` }, storage, deps(now));
      expect(r.allow).toBe(true);
    }
    // Now a burst in the next minute — far above the low baseline avg.
    now = 30 * 60_000;
    const results = [];
    for (let i = 0; i < 20; i++) {
      results.push(await reserveSmsSend({ phoneE164: `+1917555${2000 + i}`, leadId: `lead-burst-${i}` }, storage, deps(now)));
    }
    const denied = results.filter((r) => !r.allow && r.reason === 'budget_anomaly');
    expect(denied.length).toBeGreaterThan(0);
  });

  it('operator override "forced_allow" grants storm-surge headroom past the anomaly threshold', async () => {
    await setBudgetOverride(storage, 'forced_allow');
    let now = 0;
    const results = [];
    for (let i = 0; i < 20; i++) {
      now += 1;
      results.push(await reserveSmsSend({ phoneE164: `+1917555${3000 + i}`, leadId: `lead-forced-${i}` }, storage, deps(now)));
    }
    expect(results.every((r) => r.allow)).toBe(true);
  });
});

describe('claimSmsSend', () => {
  it('denies with no_reservation when reserve() was never called for this lead', async () => {
    const r = await claimSmsSend({ leadId: 'lead-1', phoneE164: '+15165550100' }, storage, deps(1_000));
    expect(r).toEqual({ allow: false, reason: 'no_reservation' });
  });

  it('claims a fresh reservation exactly once', async () => {
    await reserveSmsSend({ phoneE164: '+15165550100', leadId: 'lead-1' }, storage, deps(1_000));
    const first = await claimSmsSend({ leadId: 'lead-1', phoneE164: '+15165550100' }, storage, deps(1_100));
    expect(first).toEqual({ allow: true });
    const second = await claimSmsSend({ leadId: 'lead-1', phoneE164: '+15165550100' }, storage, deps(1_200));
    expect(second).toEqual({ allow: false, reason: 'already_sent' });
  });

  it('aborts an in-flight send when STOP arrives after the token was issued but before claim (send-time re-check)', async () => {
    const reserved = await reserveSmsSend({ phoneE164: '+15165550100', leadId: 'lead-1' }, storage, deps(1_000));
    expect(reserved.allow).toBe(true);
    // STOP arrives here, before the queue delivers the message.
    suppressed.add('+15165550100');
    const claimed = await claimSmsSend({ leadId: 'lead-1', phoneE164: '+15165550100' }, storage, deps(1_500));
    expect(claimed).toEqual({ allow: false, reason: 'suppressed' });
  });

  it('queue-consumer and slo-sweep racing the same claim yield exactly one allow', async () => {
    await reserveSmsSend({ phoneE164: '+15165550100', leadId: 'lead-1' }, storage, deps(1_000));
    const [a, b] = [
      await claimSmsSend({ leadId: 'lead-1', phoneE164: '+15165550100' }, storage, deps(2_000)),
      await claimSmsSend({ leadId: 'lead-1', phoneE164: '+15165550100' }, storage, deps(2_000)),
    ];
    const allowed = [a, b].filter((r) => r.allow);
    expect(allowed).toHaveLength(1);
  });

  it('denies when the phone on the claim does not match the reservation', async () => {
    await reserveSmsSend({ phoneE164: '+15165550100', leadId: 'lead-1' }, storage, deps(1_000));
    const r = await claimSmsSend({ leadId: 'lead-1', phoneE164: '+15165550199' }, storage, deps(1_100));
    expect(r).toEqual({ allow: false, reason: 'no_reservation' });
  });
});

describe('live submit racing slo-sweep for the same phone (both reserve through the DO)', () => {
  it('exactly one of a live intake reserve() and a sweep-standing-in reserve() succeeds', async () => {
    // A live submit for lead-live and a slo-sweep re-attempt for an older
    // lead-stale (whose own original reserve was denied earlier) race for the
    // same phone number in the same tick.
    const [live, sweep] = [
      await reserveSmsSend({ phoneE164: '+15165550100', leadId: 'lead-live' }, storage, deps(5_000)),
      await reserveSmsSend({ phoneE164: '+15165550100', leadId: 'lead-stale' }, storage, deps(5_000)),
    ];
    const allowed = [live, sweep].filter((r) => r.allow);
    expect(allowed).toHaveLength(1);
  });
});
