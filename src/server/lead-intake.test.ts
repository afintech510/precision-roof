import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SqlExecutor, SqlParam } from '../db/executor';
import { createRepositories } from '../db/repositories';
import { intakeLead, normalizeNanpPhone, type LeadIntakeDeps, type LeadIntakeRequest } from './lead-intake';
import type { ReserveResult } from './lead-authority';

const UP = readFileSync(join(process.cwd(), 'migrations', '0001_init_operational_store.sql'), 'utf8');

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

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  db.exec(UP);
  repos = createRepositories(nodeExecutor(db));
  ids = 0;
});

const baseDeps = (overrides: Partial<LeadIntakeDeps> = {}): LeadIntakeDeps => ({
  now: 1_000_000,
  newId: () => `id-${++ids}`,
  ...overrides,
});

const validReq: LeadIntakeRequest = {
  name: 'Pat Doe',
  phone: '(516) 555-0142',
  zip: '11743', // advertising: huntington
  service: 'roof-replacement',
  consentText: 'I agree to receive texts...',
  consentVersion: 'v1',
  turnstileVerified: true,
};

describe('normalizeNanpPhone', () => {
  it('normalizes common US formats to +1XXXXXXXXXX', () => {
    expect(normalizeNanpPhone('(516) 555-0142')).toBe('+15165550142');
    expect(normalizeNanpPhone('516-555-0142')).toBe('+15165550142');
    expect(normalizeNanpPhone('+15165550142')).toBe('+15165550142');
    expect(normalizeNanpPhone('15165550142')).toBe('+15165550142');
    expect(normalizeNanpPhone('5165550142')).toBe('+15165550142');
  });

  it('rejects non-NANP / malformed numbers', () => {
    expect(normalizeNanpPhone('+442071838750')).toBeNull(); // UK
    expect(normalizeNanpPhone('123')).toBeNull();
    expect(normalizeNanpPhone('0165550142')).toBeNull(); // area code can't start 0/1
    expect(normalizeNanpPhone('5161550142')).toBeNull(); // exchange code can't start 0/1
    expect(normalizeNanpPhone(undefined)).toBeNull();
    expect(normalizeNanpPhone(12345)).toBeNull();
  });
});

describe('intakeLead — malformed input (no DB writes)', () => {
  it('rejects a missing name', async () => {
    const r = await intakeLead({ ...validReq, name: '  ' }, repos, baseDeps());
    expect(r).toEqual({ outcome: 'malformed', reason: 'missing_name' });
  });

  it('rejects an invalid phone', async () => {
    const r = await intakeLead({ ...validReq, phone: '123' }, repos, baseDeps());
    expect(r).toEqual({ outcome: 'malformed', reason: 'invalid_phone' });
  });

  it('rejects an invalid zip', async () => {
    const r = await intakeLead({ ...validReq, zip: '117' }, repos, baseDeps());
    expect(r).toEqual({ outcome: 'malformed', reason: 'invalid_zip' });
  });

  it('rejects a missing service', async () => {
    const r = await intakeLead({ ...validReq, service: '' }, repos, baseDeps());
    expect(r).toEqual({ outcome: 'malformed', reason: 'missing_service' });
  });

  it('rejects missing TCPA consent text/version', async () => {
    const r = await intakeLead({ ...validReq, consentText: '' }, repos, baseDeps());
    expect(r).toEqual({ outcome: 'malformed', reason: 'missing_consent' });
  });

  it('writes nothing to the lead table on malformed input', async () => {
    await intakeLead({ ...validReq, name: '' }, repos, baseDeps());
    expect(await repos.lead.listByStatus('new')).toEqual([]);
  });
});

describe('intakeLead — East-End gate (§771-B)', () => {
  it('creates an informational_only lead for a gated ZIP, never reserving/dispatching', async () => {
    let called = false;
    const dispatchSms = async (): Promise<ReserveResult> => {
      called = true;
      return { allow: true, token: 't' };
    };
    const r = await intakeLead({ ...validReq, zip: '11968' }, repos, baseDeps({ dispatchSms }));
    expect(r.outcome).toBe('created');
    expect(r.dispatch).toBe('suppressed_policy');
    expect(called).toBe(false);

    const lead = await repos.lead.getById(r.leadId!);
    expect(lead?.advertising_status).toBe('informational_only');
    expect(lead?.sms_suppressed_reason).toBe('east_end_gate');
  });
});

describe('intakeLead — Turnstile fallback (anti-spam for the automated send)', () => {
  it('suppresses SMS but still records the lead when Turnstile did not verify', async () => {
    const r = await intakeLead({ ...validReq, turnstileVerified: false }, repos, baseDeps());
    expect(r.outcome).toBe('created');
    expect(r.dispatch).toBe('suppressed_policy');
    const lead = await repos.lead.getById(r.leadId!);
    expect(lead?.sms_suppressed_reason).toBe('turnstile_fallback');
    expect(lead?.advertising_status).toBe('active'); // still an in-area advertising lead
  });
});

describe('intakeLead — dispatch binding not configured', () => {
  it('records the lead as dispatch: not_configured without an error', async () => {
    const r = await intakeLead(validReq, repos, baseDeps());
    expect(r.outcome).toBe('created');
    expect(r.dispatch).toBe('not_configured');
    const lead = await repos.lead.getById(r.leadId!);
    expect(lead?.sms_suppressed_reason).toBeNull();
  });
});

describe('intakeLead — DO reservation wired', () => {
  it('enqueues (dispatch: queued) on an allowed reservation, lead row exists before the call', async () => {
    let sawLeadRowAtDispatchTime = false;
    const dispatchSms = async (leadId: string): Promise<ReserveResult> => {
      sawLeadRowAtDispatchTime = (await repos.lead.getById(leadId)) !== undefined;
      return { allow: true, token: 'tok-1' };
    };
    const r = await intakeLead(validReq, repos, baseDeps({ dispatchSms }));
    expect(r.dispatch).toBe('queued');
    expect(sawLeadRowAtDispatchTime).toBe(true);
  });

  it('maps a suppressed reservation to opt_out and patches the lead row', async () => {
    const dispatchSms = async (): Promise<ReserveResult> => ({ allow: false, reason: 'suppressed' });
    const r = await intakeLead(validReq, repos, baseDeps({ dispatchSms }));
    expect(r.dispatch).toBe('suppressed_policy');
    const lead = await repos.lead.getById(r.leadId!);
    expect(lead?.sms_suppressed_reason).toBe('opt_out');
  });

  it('maps a rate_limited/budget_exceeded denial to deferred (retried by a later sweep)', async () => {
    const dispatchSms = async (): Promise<ReserveResult> => ({ allow: false, reason: 'rate_limited' });
    const r = await intakeLead(validReq, repos, baseDeps({ dispatchSms }));
    expect(r.dispatch).toBe('deferred');
    const lead = await repos.lead.getById(r.leadId!);
    expect(lead?.sms_suppressed_reason).toBeNull();
    expect(lead?.status).toBe('new');
  });

  it('passes the live suppression-table state into the reservation call', async () => {
    await repos.suppression.suppress('sms', '+15165550142', 500, 'STOP');
    let seenIsSuppressed: boolean | undefined;
    const dispatchSms = async (_id: string, _phone: string, _now: number, isSuppressed: boolean): Promise<ReserveResult> => {
      seenIsSuppressed = isSuppressed;
      return isSuppressed ? { allow: false, reason: 'suppressed' } : { allow: true, token: 't' };
    };
    await intakeLead(validReq, repos, baseDeps({ dispatchSms }));
    expect(seenIsSuppressed).toBe(true);
  });
});

describe('intakeLead — consent evidence', () => {
  it('appends an immutable consent_record row for every well-formed submission', async () => {
    const r = await intakeLead(validReq, repos, baseDeps());
    const row = db
      .prepare('SELECT phone_e164, consent_version, lead_id FROM consent_record WHERE lead_id = ?')
      .get(r.leadId!) as { phone_e164: string; consent_version: string; lead_id: string };
    expect(row.phone_e164).toBe('+15165550142');
    expect(row.consent_version).toBe('v1');

    const lead = await repos.lead.getById(r.leadId!);
    expect(lead?.consent_version).toBe('v1');
    expect(lead?.consent_timestamp).toBe(1_000_000);
  });
});
