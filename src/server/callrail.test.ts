import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { SqlExecutor, SqlParam } from '../db/executor';
import { createRepositories } from '../db/repositories';
import {
  handleCallrailMissedCall,
  MISSED_CALL_TEXT_BACK_BODY,
  type CallrailCallWebhook,
  type CallrailDeps,
} from './callrail';
import type { ReserveOutcome } from './sms-authority';
import type { SmsDispatchMessage } from './sms-dispatch';

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

let repos: ReturnType<typeof createRepositories>;
let ids: number;
let enqueued: SmsDispatchMessage[];
let reserveResult: ReserveOutcome;
let reserveCalls: number;

const missedCall = (over: Partial<CallrailCallWebhook> = {}): CallrailCallWebhook => ({
  id: 'CAL1',
  answered: false,
  direction: 'inbound',
  customer_phone_number: '+15165550100',
  tracking_phone_number: '+16315550199',
  ...over,
});

function deps(over: Partial<CallrailDeps> = {}): CallrailDeps {
  return {
    now: 10_000,
    newId: () => `id-${++ids}`,
    reserveSms: async () => { reserveCalls++; return reserveResult; },
    enqueueSms: async (msg) => { enqueued.push(msg); },
    ...over,
  };
}

beforeEach(() => {
  const db = new DatabaseSync(':memory:');
  for (const m of MIGRATIONS) db.exec(m);
  repos = createRepositories(nodeExecutor(db));
  ids = 0;
  enqueued = [];
  reserveCalls = 0;
  reserveResult = { allow: true, token: 'tok-1' };
});

describe('CallRail missed-call text-back', () => {
  it('texts back an unanswered inbound call via the 05b send path', async () => {
    const result = await handleCallrailMissedCall(missedCall(), repos, deps());
    expect(result).toEqual({ processed: true, textedBack: true, leadId: 'id-1' });
    expect(enqueued).toEqual([
      { leadId: 'id-1', phoneE164: '+15165550100', body: MISSED_CALL_TEXT_BACK_BODY, allowToken: 'tok-1' },
    ]);
    expect(reserveCalls).toBe(1);

    const lead = await repos.lead.getById('id-1');
    expect(lead?.service).toBe('missed_call_callback');
    expect(lead?.channel).toBe('sms');
    expect(lead?.phone_e164).toBe('+15165550100');
  });

  it('is idempotent per CallRail call id', async () => {
    await handleCallrailMissedCall(missedCall(), repos, deps());
    const second = await handleCallrailMissedCall(missedCall(), repos, deps());
    expect(second).toEqual({ processed: false });
    expect(enqueued).toHaveLength(1);
  });

  it('does nothing for an answered call', async () => {
    const result = await handleCallrailMissedCall(missedCall({ answered: true }), repos, deps());
    expect(result).toEqual({ processed: true, textedBack: false, reason: 'not_missed' });
    expect(enqueued).toHaveLength(0);
    expect(reserveCalls).toBe(0);
  });

  it('does nothing for an outbound call', async () => {
    const result = await handleCallrailMissedCall(missedCall({ direction: 'outbound' }), repos, deps());
    expect(result).toEqual({ processed: true, textedBack: false, reason: 'not_missed' });
    expect(enqueued).toHaveLength(0);
  });

  it('rejects a malformed / non-NANP caller number without reserving', async () => {
    const result = await handleCallrailMissedCall(missedCall({ customer_phone_number: '+442071838750' }), repos, deps());
    expect(result).toEqual({ processed: true, textedBack: false, reason: 'malformed_phone' });
    expect(reserveCalls).toBe(0);
  });

  it('rejects a missing caller number without reserving', async () => {
    const result = await handleCallrailMissedCall(missedCall({ customer_phone_number: undefined }), repos, deps());
    expect(result).toEqual({ processed: true, textedBack: false, reason: 'malformed_phone' });
    expect(reserveCalls).toBe(0);
  });

  it('honors a DO deny (e.g. suppressed) without enqueuing', async () => {
    reserveResult = { allow: false, reason: 'suppressed' };
    const result = await handleCallrailMissedCall(missedCall(), repos, deps());
    expect(result).toEqual({ processed: true, textedBack: false, reason: 'suppressed' });
    expect(enqueued).toHaveLength(0);
    const lead = await repos.lead.getById('id-1');
    expect(lead?.channel).toBeNull();
  });

  it('calls the DO reservation at most once per call', async () => {
    await handleCallrailMissedCall(missedCall(), repos, deps());
    expect(reserveCalls).toBe(1);
  });
});
