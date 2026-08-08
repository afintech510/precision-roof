import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { D1Database } from '@cloudflare/workers-types';
import type { SqlParam } from '../db/executor';
import { createRepositories } from '../db/repositories';
import { queue } from './sms-queue-consumer';
import type { SmsDispatchMessage } from './sms-dispatch';
import type { ReserveOutcome } from './sms-authority';

// Adapter test for the Queue consumer's ack/retry translation (spec §3.1):
// a terminal dispatch outcome (dispatched, or a denial reason other than
// send_failed — already_claimed/suppressed/budget/window) must ack so the
// message never redelivers; only a transient send_failed should retry so the
// queue's own backoff picks it up again.

const MIG_DIR = join(process.cwd(), 'migrations');
const MIGRATIONS = readdirSync(MIG_DIR)
  .filter((f) => /^\d+_.*\.sql$/.test(f))
  .sort()
  .map((f) => readFileSync(join(MIG_DIR, f), 'utf8'));

function fakeD1(db: InstanceType<typeof DatabaseSync>): D1Database {
  return {
    prepare(sql: string) {
      let bound: SqlParam[] = [];
      const stmt = {
        bind(...params: SqlParam[]) {
          bound = params;
          return stmt;
        },
        async run() {
          const r = db.prepare(sql).run(...bound);
          return { meta: { changes: Number(r.changes) } };
        },
        async first<T>() {
          const r = db.prepare(sql).get(...bound);
          return (r ?? null) as T | null;
        },
        async all<T>() {
          const r = db.prepare(sql).all(...bound) as T[];
          return { results: r };
        },
      };
      return stmt;
    },
  } as unknown as D1Database;
}

function fakeSmsAuthority(claimResult: ReserveOutcome | { allow: true } | { allow: false; reason: string }) {
  return {
    idFromName: (name: string) => name,
    get: () => ({
      reserve: async () => ({ allow: true, token: 't1' }),
      claimSend: async () => claimResult,
    }),
  };
}

function fakeMessage(body: SmsDispatchMessage) {
  return { body, ack: vi.fn(), retry: vi.fn() };
}

let db: InstanceType<typeof DatabaseSync>;

beforeEach(async () => {
  db = new DatabaseSync(':memory:');
  for (const m of MIGRATIONS) db.exec(m);
  const repos = createRepositories({
    async run(sql: string, params: SqlParam[] = []) { return { changes: Number(db.prepare(sql).run(...params).changes) }; },
    async get<T>(sql: string, params: SqlParam[] = []) { const r = db.prepare(sql).get(...params); return r === undefined ? undefined : (r as T); },
    async all<T>(sql: string, params: SqlParam[] = []) { return db.prepare(sql).all(...params) as T[]; },
  });
  await repos.lead.insert({
    id: 'lead-1', createdAt: 1, name: 'Pat Doe', phoneE164: '+15165550100',
    zip: '11743', service: 'roof-repair',
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const msg: SmsDispatchMessage = { leadId: 'lead-1', phoneE164: '+15165550100', body: 'hi', allowToken: 'tok-1' };

function fullEnv(overrides: Record<string, unknown> = {}) {
  return {
    OP_STORE: fakeD1(db),
    SMS_AUTHORITY: fakeSmsAuthority({ allow: true }),
    TWILIO_ACCOUNT_SID: 'AC123',
    TWILIO_AUTH_TOKEN: 'tok',
    TWILIO_FROM_NUMBER: '+15165550199',
    ...overrides,
  } as never;
}

describe('sms-queue-consumer — missing config', () => {
  it('skips (no ack/retry, no D1 touch) when SMS_AUTHORITY is absent', async () => {
    const m = fakeMessage(msg);
    await queue({ messages: [m] } as never, { OP_STORE: fakeD1(db) } as never);
    expect(m.ack).not.toHaveBeenCalled();
    expect(m.retry).not.toHaveBeenCalled();
  });

  it('skips when Twilio secrets are absent', async () => {
    const m = fakeMessage(msg);
    await queue({ messages: [m] } as never, {
      OP_STORE: fakeD1(db), SMS_AUTHORITY: fakeSmsAuthority({ allow: true }),
    } as never);
    expect(m.ack).not.toHaveBeenCalled();
    expect(m.retry).not.toHaveBeenCalled();
  });
});

describe('sms-queue-consumer — ack/retry translation', () => {
  it('acks on a successful dispatch', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ sid: 'SM1' }), { status: 200 })));
    const m = fakeMessage(msg);
    await queue({ messages: [m] } as never, fullEnv());
    expect(m.ack).toHaveBeenCalledOnce();
    expect(m.retry).not.toHaveBeenCalled();
  });

  it('acks (does not retry) on a terminal denial like already_claimed', async () => {
    const m = fakeMessage(msg);
    await queue({ messages: [m] } as never, fullEnv({
      SMS_AUTHORITY: fakeSmsAuthority({ allow: false, reason: 'already_claimed' }),
    }));
    expect(m.ack).toHaveBeenCalledOnce();
    expect(m.retry).not.toHaveBeenCalled();
  });

  it('retries on a transient send_failed', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ code: 21211, message: 'bad number' }), { status: 400 })));
    const m = fakeMessage(msg);
    await queue({ messages: [m] } as never, fullEnv());
    expect(m.retry).toHaveBeenCalledOnce();
    expect(m.ack).not.toHaveBeenCalled();
  });
});
