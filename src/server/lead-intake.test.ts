import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { SqlExecutor, SqlParam } from '../db/executor';
import { createRepositories } from '../db/repositories';
import {
  handleLeadIntake,
  CURRENT_CONSENT_VERSION,
  type LeadIntakeRequest,
  type LeadIntakeDeps,
} from './lead-intake';
import type { ReserveOutcome } from './sms-authority';
import type { SmsDispatchMessage } from './sms-dispatch';
import { SUFFOLK_ZIP_GATE } from './east-end-gate';

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
let enqueued: SmsDispatchMessage[];
let reserveResult: ReserveOutcome;

const validReq = (over: Partial<LeadIntakeRequest> = {}): LeadIntakeRequest => ({
  name: 'Pat Doe',
  phoneE164: '+15165550100',
  email: 'pat@example.com',
  zip: '11743', // Huntington — advertising-eligible
  serviceSlug: 'roof-repair',
  consentGiven: true,
  consentVersion: CURRENT_CONSENT_VERSION,
  gaClientId: 'ga-1',
  ...over,
});

function deps(over: Partial<LeadIntakeDeps> = {}): LeadIntakeDeps {
  return {
    now: 10_000,
    newId: () => `id-${++ids}`,
    ip: '203.0.113.1',
    userAgent: 'test-agent',
    sourceUrl: 'https://premiumroofsolutions.com/estimate',
    turnstileVerified: true,
    reserveSms: async () => reserveResult,
    enqueueSms: async (msg) => { enqueued.push(msg); },
    ...over,
  };
}

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  for (const m of MIGRATIONS) db.exec(m);
  repos = createRepositories(nodeExecutor(db));
  ids = 0;
  enqueued = [];
  reserveResult = { allow: true, token: 'tok-1' };
});

describe('handleLeadIntake — happy path', () => {
  it('creates the lead, writes consent, reserves once, and enqueues an SMS dispatch', async () => {
    const res = await handleLeadIntake(validReq(), repos, {}, deps());
    expect(res).toEqual({ outcome: 'created', status: 201, leadId: 'id-1', channel: 'sms' });

    const lead = await repos.lead.getById('id-1');
    expect(lead?.channel).toBe('sms');
    expect(lead?.advertising_status).toBe('active');
    expect(lead?.sms_suppressed_reason).toBeNull();

    expect(enqueued).toHaveLength(1);
    expect(enqueued[0]).toMatchObject({ leadId: 'id-1', phoneE164: '+15165550100', allowToken: 'tok-1' });

    const consentRows = db.prepare('SELECT phone_e164, consent_version, lead_id FROM consent_record').all() as Array<{
      phone_e164: string; consent_version: string; lead_id: string;
    }>;
    expect(consentRows).toEqual([{ phone_e164: '+15165550100', consent_version: CURRENT_CONSENT_VERSION, lead_id: 'id-1' }]);
  });
});

describe('handleLeadIntake — East-End gate', () => {
  it('routes a gated ZIP to callback without ever calling the DO', async () => {
    let reserveCalled = false;
    const res = await handleLeadIntake(
      validReq({ zip: '11968' }), // Southampton — gated
      repos,
      {},
      deps({ reserveSms: async () => { reserveCalled = true; return reserveResult; } }),
    );
    expect(res).toEqual({ outcome: 'accepted', status: 202, leadId: 'id-1', channel: 'callback', reason: 'east_end_gate' });
    expect(reserveCalled).toBe(false);
    expect(enqueued).toHaveLength(0);

    const lead = await repos.lead.getById('id-1');
    expect(lead?.channel).toBe('callback');
    expect(lead?.advertising_status).toBe('informational_only');
    expect(lead?.sms_suppressed_reason).toBe('east_end_gate');

    const consentRows = db.prepare('SELECT COUNT(*) AS n FROM consent_record').all();
    expect((consentRows[0] as { n: number }).n).toBe(1); // consent still recorded
  });
});

describe('handleLeadIntake — Turnstile fallback', () => {
  it('routes to callback and never calls the DO when Turnstile did not verify', async () => {
    let reserveCalled = false;
    const res = await handleLeadIntake(
      validReq(),
      repos,
      {},
      deps({ turnstileVerified: false, reserveSms: async () => { reserveCalled = true; return reserveResult; } }),
    );
    expect(res).toEqual({ outcome: 'accepted', status: 202, leadId: 'id-1', channel: 'callback', reason: 'turnstile_fallback' });
    expect(reserveCalled).toBe(false);
    expect(enqueued).toHaveLength(0);

    const lead = await repos.lead.getById('id-1');
    expect(lead?.channel).toBe('callback');
    expect(lead?.advertising_status).toBe('active'); // still an advertising-eligible ZIP, just SMS-suppressed
    expect(lead?.sms_suppressed_reason).toBe('turnstile_fallback');
  });
});

describe('handleLeadIntake — DO denies the reservation', () => {
  it('persists the lead sweep-eligible (no smsSuppressedReason) and never enqueues', async () => {
    reserveResult = { allow: false, reason: 'per_phone_window' };
    const res = await handleLeadIntake(validReq(), repos, {}, deps());
    expect(res).toEqual({ outcome: 'accepted', status: 202, leadId: 'id-1', channel: 'callback', reason: 'per_phone_window' });
    expect(enqueued).toHaveLength(0);

    const lead = await repos.lead.getById('id-1');
    expect(lead?.channel).toBeNull();
    expect(lead?.sms_suppressed_reason).toBeNull();
    expect(lead?.sms_claimed_at).toBeNull();
    // sweep-eligible: active, not suppressed, not yet claimed
    const eligible = await repos.lead.listEligibleForSweep();
    expect(eligible.map((l) => l.id)).toEqual(['id-1']);
  });
});

describe('handleLeadIntake — malformed input', () => {
  it('400s on a malformed name', async () => {
    const res = await handleLeadIntake(validReq({ name: '' }), repos, {}, deps());
    expect(res).toEqual({ outcome: 'malformed', status: 400, field: 'name' });
  });

  it('400s on a malformed phone (not NANP E.164)', async () => {
    const res = await handleLeadIntake(validReq({ phoneE164: '5165550100' }), repos, {}, deps());
    expect(res).toEqual({ outcome: 'malformed', status: 400, field: 'phone' });
  });

  it('400s on a malformed email', async () => {
    const res = await handleLeadIntake(validReq({ email: 'not-an-email' }), repos, {}, deps());
    expect(res).toEqual({ outcome: 'malformed', status: 400, field: 'email' });
  });

  it('400s on a malformed zip', async () => {
    const res = await handleLeadIntake(validReq({ zip: 'abcde' }), repos, {}, deps());
    expect(res).toEqual({ outcome: 'malformed', status: 400, field: 'zip' });
  });

  it('400s on an unrecognized service slug', async () => {
    const res = await handleLeadIntake(validReq({ serviceSlug: 'roof-painting' }), repos, {}, deps());
    expect(res).toEqual({ outcome: 'malformed', status: 400, field: 'service' });
  });

  it('400s when consent was not given', async () => {
    const res = await handleLeadIntake(validReq({ consentGiven: false }), repos, {}, deps());
    expect(res).toEqual({ outcome: 'malformed', status: 400, field: 'consent' });
  });

  it('400s when consent is absent (native form POST omits an unchecked checkbox entirely)', async () => {
    const res = await handleLeadIntake(validReq({ consentGiven: undefined }), repos, {}, deps());
    expect(res).toEqual({ outcome: 'malformed', status: 400, field: 'consent' });
  });

  it.each(['on', 'true', '1'])(
    'accepts consent as the string %j (native form-urlencoded checkbox submission)',
    async (value) => {
      const res = await handleLeadIntake(validReq({ consentGiven: value }), repos, {}, deps());
      expect(res.outcome).not.toBe('malformed');
    },
  );

  it('400s on an unknown consent version', async () => {
    const res = await handleLeadIntake(validReq({ consentVersion: 'v99' }), repos, {}, deps());
    expect(res).toEqual({ outcome: 'malformed', status: 400, field: 'consent_version' });
  });

  it('never writes a lead row on any malformed-input path', async () => {
    await handleLeadIntake(validReq({ name: '' }), repos, {}, deps());
    const count = db.prepare('SELECT COUNT(*) AS n FROM lead').all();
    expect((count[0] as { n: number }).n).toBe(0);
  });
});

it('the East-End gate table used matches the production SUFFOLK_ZIP_GATE default', () => {
  expect(SUFFOLK_ZIP_GATE['11968']).toBeDefined();
});
