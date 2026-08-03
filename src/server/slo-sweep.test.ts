import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { SqlExecutor, SqlParam } from '../db/executor';
import { createRepositories } from '../db/repositories';
import { runSloSweep, SPEED_TO_LEAD_BODY } from './slo-sweep';
import type { SmsAuthorityStub } from './sms-dispatch';
import { SMS_AUTHORITY_SCHEMA, reserveSmsSend, claimSmsSend } from './sms-authority';

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

let opDb: InstanceType<typeof DatabaseSync>;
let repos: ReturnType<typeof createRepositories>;
let ids: number;
const deps = () => ({ now: 20_000, newId: () => `id-${++ids}`, sendSms: async () => ({ ok: true as const, messageSid: `SM-${++ids}` }) });

beforeEach(async () => {
  opDb = new DatabaseSync(':memory:');
  for (const m of MIGRATIONS) opDb.exec(m);
  repos = createRepositories(nodeExecutor(opDb));
  ids = 0;
});

async function insertLead(overrides: Partial<{ id: string; phoneE164: string; advertisingStatus: 'active' | 'informational_only'; smsSuppressedReason: 'turnstile_fallback' | 'east_end_gate' | 'opt_out' | null; claimed: boolean }> = {}) {
  await repos.lead.insert({
    id: overrides.id ?? 'lead-1', createdAt: 1, name: 'Pat Doe', phoneE164: overrides.phoneE164 ?? '+15165550100',
    zip: '11743', service: 'roof-repair',
    advertisingStatus: overrides.advertisingStatus ?? 'active',
    smsSuppressedReason: overrides.smsSuppressedReason ?? null,
  });
  if (overrides.claimed) await repos.lead.claimForSms(overrides.id ?? 'lead-1', 5);
}

describe('runSloSweep — scope', () => {
  it('skips informational_only, turnstile_fallback, and already-claimed leads', async () => {
    await insertLead({ id: 'lead-gated', advertisingStatus: 'informational_only' });
    await insertLead({ id: 'lead-fallback', phoneE164: '+15165550101', smsSuppressedReason: 'turnstile_fallback' });
    await insertLead({ id: 'lead-claimed', phoneE164: '+15165550102', claimed: true });
    const authority: SmsAuthorityStub = { reserve: async () => ({ allow: true, token: 't' }), claimSend: async () => ({ allow: true }) };
    const res = await runSloSweep(repos, authority, deps());
    expect(res.swept).toBe(0);
    expect(res.sent).toBe(0);
  });

  it('reserves fresh and dispatches for an eligible lead with no prior reservation', async () => {
    await insertLead();
    const authority: SmsAuthorityStub = {
      reserve: async () => ({ allow: true, token: 't1' }),
      claimSend: async (leadId, phone) => (leadId === 'lead-1' && phone === '+15165550100' ? { allow: true } : { allow: false, reason: 'no_reservation' }),
    };
    const res = await runSloSweep(repos, authority, deps());
    expect(res.swept).toBe(1);
    expect(res.sent).toBe(1);
    const lead = await repos.lead.getById('lead-1');
    expect(lead?.status).toBe('sms_sent');
  });

  it('claims a stranded existing reservation directly (no fresh reserve needed)', async () => {
    await insertLead();
    let reserveCalls = 0;
    const authority: SmsAuthorityStub = {
      reserve: async () => { reserveCalls++; return { allow: true, token: 't1' }; },
      claimSend: async () => ({ allow: true }),
    };
    const res = await runSloSweep(repos, authority, deps());
    expect(res.sent).toBe(1);
    expect(reserveCalls).toBe(0); // claimSend allowed directly — no need to reserve fresh
  });

  it('skips (does not resend) when the DO denies the fresh reservation', async () => {
    await insertLead();
    const authority: SmsAuthorityStub = {
      reserve: async () => ({ allow: false, reason: 'budget_anomaly' }),
      claimSend: async () => ({ allow: false, reason: 'no_reservation' }),
    };
    const res = await runSloSweep(repos, authority, deps());
    expect(res.sent).toBe(0);
    expect(res.skipped).toEqual([{ leadId: 'lead-1', reason: 'budget_anomaly' }]);
  });
});

describe('runSloSweep — live submit racing the sweep for the same phone (real DO authority core)', () => {
  it('exactly one SMS goes out when a live intake reserve() and the sweep reserve() race in the same tick', async () => {
    // Two leads, same phone: lead-stale is what the sweep will pick up (its own
    // earlier intake reserve() was denied, e.g. by budget, so it's still
    // eligible); lead-live is a brand-new submit hitting the DO at the same
    // moment. Both funnel through the SAME serialized DO storage.
    const doDb = new DatabaseSync(':memory:');
    doDb.exec(SMS_AUTHORITY_SCHEMA);
    const doStorage = nodeExecutor(doDb);
    const suppressed = new Set<string>();
    const authDeps = (now: number) => ({ now, newId: () => `tok-${++ids}`, isSuppressed: async (p: string) => suppressed.has(p) });

    await insertLead({ id: 'lead-stale', phoneE164: '+15165550100' });

    const authority: SmsAuthorityStub = {
      reserve: (phone, leadId) => reserveSmsSend({ phoneE164: phone, leadId }, doStorage, authDeps(30_000)),
      claimSend: (leadId, phone) => claimSmsSend({ leadId, phoneE164: phone }, doStorage, authDeps(30_100)),
    };

    // The live submit's own intake reserve() call, racing the sweep.
    const liveReserve = await reserveSmsSend({ phoneE164: '+15165550100', leadId: 'lead-live' }, doStorage, authDeps(30_000));

    const sweep = await runSloSweep(repos, authority, deps());

    const liveAllowed = liveReserve.allow;
    const sweepAllowed = sweep.sent === 1;
    expect([liveAllowed, sweepAllowed].filter(Boolean)).toHaveLength(1);
  });
});

describe('SPEED_TO_LEAD_BODY', () => {
  it('mentions STOP so the outbound SMS satisfies opt-out disclosure', () => {
    expect(SPEED_TO_LEAD_BODY).toMatch(/STOP/);
  });
});
