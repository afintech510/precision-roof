import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { D1Database } from '@cloudflare/workers-types';
import type { SqlParam } from '../db/executor';
import { POST, GET } from '../pages/api/webhooks/callrail';
import { computeCallrailSignature } from './callrail-signature';
import type { ReserveOutcome } from './sms-authority';
import type { SmsDispatchMessage } from './sms-dispatch';
import { __setEnv } from '../test/cf-workers-stub';

// Route-level test for the /api/webhooks/callrail adapter: signs a fixture
// post-call body with the same secret the route expects, backed by a fake D1
// over node:sqlite (same schema migrations as prod) plus a fake SMS_AUTHORITY
// DO stub + SMS_QUEUE, mirroring the /api/lead route-test pattern — this is
// the same 05b send path, not a second pipeline.

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

function fakeSmsAuthority(reserveResult: ReserveOutcome) {
  return {
    idFromName: (name: string) => name,
    get: () => ({
      reserve: async (): Promise<ReserveOutcome> => reserveResult,
      claimSend: async () => ({ allow: true as const }),
    }),
  };
}

function fakeSmsQueue(sink: SmsDispatchMessage[]) {
  return { send: async (msg: SmsDispatchMessage) => { sink.push(msg); } };
}

const SECRET = 'test-callrail-secret';
let db: InstanceType<typeof DatabaseSync>;
let sent: SmsDispatchMessage[];
let env: Record<string, unknown>;

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  for (const m of MIGRATIONS) db.exec(m);
  sent = [];
  env = {
    OP_STORE: fakeD1(db),
    CALLRAIL_WEBHOOK_SECRET: SECRET,
    SMS_AUTHORITY: fakeSmsAuthority({ allow: true, token: 'tok-1' }),
    SMS_QUEUE: fakeSmsQueue(sent),
  };
});

function ctx(body: string, opts: { signature?: string; env?: unknown } = {}) {
  __setEnv(('env' in opts ? opts.env : env) as Record<string, unknown>);
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (opts.signature) headers['x-callrail-signature'] = opts.signature;
  const request = new Request('https://premiumroofsolutions.com/api/webhooks/callrail', {
    method: 'POST',
    headers,
    body,
  });
  return { request } as never;
}

const missedCallBody = () => JSON.stringify({
  id: 'CAL-1',
  answered: false,
  direction: 'inbound',
  customer_phone_number: '+15165550100',
  tracking_phone_number: '+16315550199',
});

describe('POST /api/webhooks/callrail', () => {
  it('503s when no runtime env is present', async () => {
    const res = await POST(ctx('{}', { env: {} }));
    expect(res.status).toBe(503);
  });

  it('503s when the webhook secret is not configured', async () => {
    const res = await POST(ctx('{}', { env: { OP_STORE: fakeD1(db) } }));
    expect(res.status).toBe(503);
  });

  it('401s on a missing signature', async () => {
    const res = await POST(ctx(missedCallBody()));
    expect(res.status).toBe(401);
  });

  it('401s on an invalid signature', async () => {
    const res = await POST(ctx(missedCallBody(), { signature: 'deadbeef' }));
    expect(res.status).toBe(401);
  });

  it('400s on a malformed body even with a valid signature over it', async () => {
    const body = 'not json';
    const sig = await computeCallrailSignature(SECRET, body);
    const res = await POST(ctx(body, { signature: sig }));
    expect(res.status).toBe(400);
  });

  it('400s on validly-parsed JSON missing an id', async () => {
    const body = JSON.stringify({ answered: false, direction: 'inbound' });
    const sig = await computeCallrailSignature(SECRET, body);
    const res = await POST(ctx(body, { signature: sig }));
    expect(res.status).toBe(400);
  });

  it('never enqueues when SMS_QUEUE is not yet bound, even when the DO allows', async () => {
    const body = missedCallBody();
    const sig = await computeCallrailSignature(SECRET, body);
    env = {
      OP_STORE: fakeD1(db),
      CALLRAIL_WEBHOOK_SECRET: SECRET,
      SMS_AUTHORITY: fakeSmsAuthority({ allow: true, token: 'tok-1' }),
    };
    const res = await POST(ctx(body, { signature: sig }));
    const out = (await res.json()) as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(out).toMatchObject({ processed: true, textedBack: true });
    expect(sent).toHaveLength(0);
  });

  it('texts back a validly signed missed call via the SMS_AUTHORITY + SMS_QUEUE bindings', async () => {
    const body = missedCallBody();
    const sig = await computeCallrailSignature(SECRET, body);
    const res = await POST(ctx(body, { signature: sig }));
    const out = (await res.json()) as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(out).toMatchObject({ processed: true, textedBack: true });
    expect(sent).toHaveLength(1);
    expect(sent[0]?.phoneE164).toBe('+15165550100');
  });

  it('is idempotent on redelivery of the same signed body', async () => {
    const body = missedCallBody();
    const sig = await computeCallrailSignature(SECRET, body);
    await POST(ctx(body, { signature: sig }));
    const res = await POST(ctx(body, { signature: sig }));
    const out = (await res.json()) as Record<string, unknown>;
    expect(out).toEqual({ processed: false });
    expect(sent).toHaveLength(1);
  });

  it('never texts back an answered call', async () => {
    const body = JSON.stringify({ id: 'CAL-2', answered: true, direction: 'inbound', customer_phone_number: '+15165550100' });
    const sig = await computeCallrailSignature(SECRET, body);
    const res = await POST(ctx(body, { signature: sig }));
    const out = (await res.json()) as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(out).toMatchObject({ processed: true, textedBack: false, reason: 'not_missed' });
    expect(sent).toHaveLength(0);
  });

  it('degrades to a transient deny (never 500s) when SMS_AUTHORITY is not yet bound', async () => {
    const body = missedCallBody();
    const sig = await computeCallrailSignature(SECRET, body);
    env = { OP_STORE: fakeD1(db), CALLRAIL_WEBHOOK_SECRET: SECRET };
    const res = await POST(ctx(body, { signature: sig }));
    const out = (await res.json()) as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(out).toMatchObject({ processed: true, textedBack: false, reason: 'budget_anomaly' });
    expect(sent).toHaveLength(0);
  });

  it('rejects GET', async () => {
    const res = await GET({} as never);
    expect(res.status).toBe(405);
  });
});
