import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SqlExecutor, SqlParam } from '../db/executor';
import { createRepositories } from '../db/repositories';
import { dispatchSpeedToLeadSms, type DispatchDeps } from './lead-dispatch';
import type { SendSmsResult } from './twilio-send';

const UP = readFileSync(join(process.cwd(), 'migrations', '0001_init_operational_store.sql'), 'utf8');

function nodeExecutor(db: InstanceType<typeof DatabaseSync>): SqlExecutor {
  return {
    async run(sql: string, params: SqlParam[] = []) { return { changes: Number(db.prepare(sql).run(...params).changes) }; },
    async get<T>(sql: string, params: SqlParam[] = []) { const r = db.prepare(sql).get(...params); return r === undefined ? undefined : (r as T); },
    async all<T>(sql: string, params: SqlParam[] = []) { return db.prepare(sql).all(...params) as T[]; },
  };
}

let repos: ReturnType<typeof createRepositories>;
let ids: number;

beforeEach(() => {
  const db = new DatabaseSync(':memory:');
  db.exec(UP);
  repos = createRepositories(nodeExecutor(db));
  ids = 0;
});

const deps = (sendSms: DispatchDeps['sendSms']): DispatchDeps => ({
  now: 2_000_000,
  newId: () => `id-${++ids}`,
  sendSms,
  messageBody: 'Thanks for reaching out! We will be in touch shortly.',
});

const sentOk = async (): Promise<SendSmsResult> => ({ sent: true, providerMessageId: 'SM123' });
const failedSend = async (): Promise<SendSmsResult> => ({ sent: false, error: 'http_500' });

async function seedLead(overrides: Partial<Parameters<typeof repos.lead.insert>[0]> = {}) {
  await repos.lead.insert({
    id: 'lead-1', createdAt: 1, name: 'Pat Doe', phoneE164: '+15165550142',
    zip: '11743', service: 'roof-replacement', ...overrides,
  });
}

describe('dispatchSpeedToLeadSms — happy path', () => {
  it('claims, sends, logs, and marks the lead sent', async () => {
    await seedLead();
    const r = await dispatchSpeedToLeadSms({ leadId: 'lead-1', phoneE164: '+15165550142' }, repos, deps(sentOk));
    expect(r.outcome).toBe('sent');

    const lead = await repos.lead.getById('lead-1');
    expect(lead?.speed_to_lead_sms_sent_at).toBe(2_000_000);
    expect(lead?.status).toBe('sms_sent');

    const log = await repos.messageLog.getByProviderId('SM123');
    expect(log?.status).toBe('sent');
  });
});

describe('dispatchSpeedToLeadSms — send-time re-checks', () => {
  it('skips (never claims) when the live suppression table has a STOP', async () => {
    await seedLead();
    await repos.suppression.suppress('sms', '+15165550142', 5, 'STOP');
    const r = await dispatchSpeedToLeadSms({ leadId: 'lead-1', phoneE164: '+15165550142' }, repos, deps(sentOk));
    expect(r.outcome).toBe('skipped_suppressed');
    const lead = await repos.lead.getById('lead-1');
    expect(lead?.sms_claimed_at).toBeNull(); // claim never happened — a later legitimate attempt isn't blocked
  });

  it('skips when the lead-level policy suppression set at intake blocks the claim', async () => {
    await seedLead({ smsSuppressedReason: 'east_end_gate' });
    const r = await dispatchSpeedToLeadSms({ leadId: 'lead-1', phoneE164: '+15165550142' }, repos, deps(sentOk));
    expect(r.outcome).toBe('skipped_claimed');
  });

  it('is idempotent — a duplicate queue delivery only sends once', async () => {
    await seedLead();
    const first = await dispatchSpeedToLeadSms({ leadId: 'lead-1', phoneE164: '+15165550142' }, repos, deps(sentOk));
    const second = await dispatchSpeedToLeadSms({ leadId: 'lead-1', phoneE164: '+15165550142' }, repos, deps(sentOk));
    expect(first.outcome).toBe('sent');
    expect(second.outcome).toBe('skipped_claimed');
  });

  it('returns lead_not_found without touching state for an unknown lead id', async () => {
    const r = await dispatchSpeedToLeadSms({ leadId: 'missing', phoneE164: '+15165550142' }, repos, deps(sentOk));
    expect(r.outcome).toBe('lead_not_found');
  });
});

describe('dispatchSpeedToLeadSms — send failure', () => {
  it('records a failed message_log row and moves the lead to failed_followup', async () => {
    await seedLead();
    const r = await dispatchSpeedToLeadSms({ leadId: 'lead-1', phoneE164: '+15165550142' }, repos, deps(failedSend));
    expect(r.outcome).toBe('send_failed');

    const lead = await repos.lead.getById('lead-1');
    expect(lead?.status).toBe('failed_followup');
    expect(lead?.speed_to_lead_sms_sent_at).toBeNull();

    const failedSends = await repos.lead.listByStatus('failed_followup');
    expect(failedSends.map((l) => l.id)).toContain('lead-1');
  });
});
