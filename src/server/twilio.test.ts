import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SqlExecutor, SqlParam } from '../db/executor';
import { createRepositories } from '../db/repositories';
import { handleTwilioStatus, handleTwilioInbound } from './twilio';

const UP = readFileSync(join(process.cwd(), 'migrations', '0001_init_operational_store.sql'), 'utf8');

function nodeExecutor(db: InstanceType<typeof DatabaseSync>): SqlExecutor {
  return {
    async run(sql: string, params: SqlParam[] = []) { return { changes: Number(db.prepare(sql).run(...params).changes) }; },
    async get<T>(sql: string, params: SqlParam[] = []) { const r = db.prepare(sql).get(...params); return r === undefined ? undefined : (r as T); },
    async all<T>(sql: string, params: SqlParam[] = []) { return db.prepare(sql).all(...params) as T[]; },
  };
}

let repos: ReturnType<typeof createRepositories>;
const deps = { now: 1000 };

beforeEach(() => {
  const db = new DatabaseSync(':memory:');
  db.exec(UP);
  repos = createRepositories(nodeExecutor(db));
});

describe('Twilio status callbacks', () => {
  beforeEach(async () => {
    await repos.messageLog.insert({ id: 'm1', channel: 'sms', providerMessageId: 'SM1', status: 'queued', statusRank: 1, createdAt: 1 });
  });

  it('advances forward and ignores out-of-order callbacks', async () => {
    expect((await handleTwilioStatus({ messageSid: 'SM1', messageStatus: 'delivered' }, repos, deps)).applied).toBe(true);
    // a late "sent" must not regress "delivered"
    expect((await handleTwilioStatus({ messageSid: 'SM1', messageStatus: 'sent' }, repos, deps)).applied).toBe(false);
  });

  it('is idempotent per MessageSid:MessageStatus', async () => {
    await handleTwilioStatus({ messageSid: 'SM1', messageStatus: 'sent' }, repos, deps);
    const dup = await handleTwilioStatus({ messageSid: 'SM1', messageStatus: 'sent' }, repos, deps);
    expect(dup.processed).toBe(false);
  });

  it('marks a hard carrier failure permanent', async () => {
    await handleTwilioStatus({ messageSid: 'SM1', messageStatus: 'failed', errorCode: 30007 }, repos, deps);
    const row = await repos.messageLog.getByProviderId('SM1');
    expect(row?.status).toBe('failed_permanent');
  });
});

describe('Twilio inbound STOP/START', () => {
  it('suppresses (sms, phone) on STOP', async () => {
    const r = await handleTwilioInbound({ messageSid: 'IM1', from: '+15165550100', body: 'STOP' }, repos, deps);
    expect(r.action).toBe('suppressed');
    expect(await repos.suppression.isSuppressed('sms', '+15165550100')).toBe(true);
  });

  it('opts back in on START (supersede)', async () => {
    await handleTwilioInbound({ messageSid: 'IM1', from: '+15165550100', body: 'STOP' }, repos, deps);
    const r = await handleTwilioInbound({ messageSid: 'IM2', from: '+15165550100', body: 'START' }, repos, deps);
    expect(r.action).toBe('opted_in');
    expect(await repos.suppression.isSuppressed('sms', '+15165550100')).toBe(false);
  });

  it('ignores a normal reply', async () => {
    const r = await handleTwilioInbound({ messageSid: 'IM9', from: '+15165550100', body: 'thanks!' }, repos, deps);
    expect(r.action).toBe('none');
  });

  it('is idempotent per inbound MessageSid', async () => {
    await handleTwilioInbound({ messageSid: 'IM1', from: '+15165550100', body: 'STOP' }, repos, deps);
    const dup = await handleTwilioInbound({ messageSid: 'IM1', from: '+15165550100', body: 'STOP' }, repos, deps);
    expect(dup.processed).toBe(false);
  });
});
