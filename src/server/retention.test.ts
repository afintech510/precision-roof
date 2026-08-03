import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SqlExecutor, SqlParam } from '../db/executor';
import { createRepositories } from '../db/repositories';
import { runRetentionSweep, DAY_MS, type RetentionThresholdsMs } from './retention';

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
let db: InstanceType<typeof DatabaseSync>;

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  db.exec(UP);
  repos = createRepositories(nodeExecutor(db));
});

const NOW = 1000 * DAY_MS;
const TIGHT: RetentionThresholdsMs = {
  webhookEventsMs: 10 * DAY_MS,
  messageLogMs: 10 * DAY_MS,
  reviewRequestContactMs: 10 * DAY_MS,
  leadConsentColumnsMs: 10 * DAY_MS,
  consentRecordMs: 10 * DAY_MS,
};
const OLD = NOW - 20 * DAY_MS; // outside every TIGHT window
const RECENT = NOW - DAY_MS; // inside every TIGHT window

describe('runRetentionSweep', () => {
  it('prunes webhook_events past the window, leaves recent rows', async () => {
    await repos.webhookEvents.claim('old:done', 'twilio', OLD);
    await repos.webhookEvents.claim('recent:done', 'twilio', RECENT);

    const result = await runRetentionSweep(repos, NOW, TIGHT);

    expect(result.webhookEventsPruned).toBe(1);
    expect(db.prepare('SELECT idempotency_key FROM webhook_events').all()).toEqual([
      { idempotency_key: 'recent:done' },
    ]);
  });

  it('anonymizes message_log to_contact past the window, leaves the rest of the row', async () => {
    await repos.messageLog.insert({ id: 'm1', channel: 'sms', toContact: '+15165550100', status: 'delivered', createdAt: OLD });
    await repos.messageLog.insert({ id: 'm2', channel: 'sms', toContact: '+15165550199', status: 'delivered', createdAt: RECENT });

    const result = await runRetentionSweep(repos, NOW, TIGHT);

    expect(result.messageLogAnonymized).toBe(1);
    const rows = db.prepare('SELECT id, to_contact, status FROM message_log ORDER BY id').all();
    expect(rows).toEqual([
      { id: 'm1', to_contact: null, status: 'delivered' },
      { id: 'm2', to_contact: '+15165550199', status: 'delivered' },
    ]);
  });

  it('anonymizes review_request.customer_contact past the window and is idempotent on a second sweep', async () => {
    await repos.reviewRequest.createPending({ id: 'r1', jobId: 'j1', customerContact: '+15165550100', channel: 'sms', requestedAt: OLD });
    await repos.reviewRequest.createPending({ id: 'r2', jobId: 'j2', customerContact: '+15165550199', channel: 'sms', requestedAt: RECENT });

    const first = await runRetentionSweep(repos, NOW, TIGHT);
    expect(first.reviewRequestAnonymized).toBe(1);

    const second = await runRetentionSweep(repos, NOW, TIGHT);
    expect(second.reviewRequestAnonymized).toBe(0); // already redacted — no-op, not re-counted

    const rows = db.prepare('SELECT id, customer_contact FROM review_request ORDER BY id').all();
    expect(rows).toEqual([
      { id: 'r1', customer_contact: '[redacted]' },
      { id: 'r2', customer_contact: '+15165550199' },
    ]);
  });

  it('scrubs lead consent ip/ua/source-url past the window but keeps consent_version', async () => {
    await repos.lead.insert({
      id: 'l1', createdAt: OLD, name: 'A', phoneE164: '+15165550100', zip: '11743', service: 'roof_repair',
      consentVersion: 'v1', consentIp: '1.2.3.4', consentUa: 'ua', consentSourceUrl: 'https://x/y',
    });
    await repos.lead.insert({
      id: 'l2', createdAt: RECENT, name: 'B', phoneE164: '+15165550199', zip: '11743', service: 'roof_repair',
      consentVersion: 'v1', consentIp: '5.6.7.8', consentUa: 'ua2', consentSourceUrl: 'https://x/z',
    });

    const result = await runRetentionSweep(repos, NOW, TIGHT);

    expect(result.leadConsentScrubbed).toBe(1);
    const old = await repos.lead.getById('l1');
    expect(old).toMatchObject({ consent_ip: null, consent_ua: null, consent_source_url: null, consent_version: 'v1' });
    const recent = await repos.lead.getById('l2');
    expect(recent).toMatchObject({ consent_ip: '5.6.7.8', consent_ua: 'ua2', consent_source_url: 'https://x/z' });
  });

  it('purges consent_record past the 4-yr window', async () => {
    await repos.consent.append({ id: 'c1', phoneE164: '+15165550100', consentText: 'I agree', consentVersion: 'v1', consentTimestamp: OLD });
    await repos.consent.append({ id: 'c2', phoneE164: '+15165550199', consentText: 'I agree', consentVersion: 'v1', consentTimestamp: RECENT });

    const result = await runRetentionSweep(repos, NOW, TIGHT);

    expect(result.consentRecordPurged).toBe(1);
    expect(db.prepare('SELECT id FROM consent_record').all()).toEqual([{ id: 'c2' }]);
  });

  it('never touches suppression, regardless of how old the entry is', async () => {
    await repos.suppression.suppress('sms', '+15165550100', OLD, 'STOP');

    await runRetentionSweep(repos, NOW, TIGHT);

    expect(await repos.suppression.isSuppressed('sms', '+15165550100')).toBe(true);
  });
});
