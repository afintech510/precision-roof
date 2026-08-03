import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { D1Database } from '@cloudflare/workers-types';
import type { SqlParam } from '../db/executor';
import { POST, GET } from '../pages/api/lead';
import { CURRENT_CONSENT_VERSION } from './lead-intake';
import type { ReserveOutcome } from './sms-authority';
import type { SmsDispatchMessage } from './sms-dispatch';
import { __setEnv } from '../test/cf-workers-stub';

// Route-level test for POST /api/lead: fake D1 over node:sqlite (same schema
// migrations as prod), plus a fake SMS_AUTHORITY DO stub (`{ idFromName, get }`
// returning `{ reserve, claimSend }`) and a fake SMS_QUEUE (`{ send }`) that
// captures sent messages, mirroring the operator/twilio route-test pattern.

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

const ROUTE_URL = 'https://premiumroofsolutions.com/api/lead';

let db: InstanceType<typeof DatabaseSync>;
let sent: SmsDispatchMessage[];
let env: Record<string, unknown>;

const validBody = (over: Record<string, unknown> = {}) => ({
  name: 'Pat Doe',
  phoneE164: '+15165550100',
  email: 'pat@example.com',
  zip: '11743',
  serviceSlug: 'roof-repair',
  consentGiven: true,
  consentVersion: CURRENT_CONSENT_VERSION,
  turnstileToken: 'good-token',
  ...over,
});

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  for (const m of MIGRATIONS) db.exec(m);
  sent = [];
  env = {
    OP_STORE: fakeD1(db),
    SMS_AUTHORITY: fakeSmsAuthority({ allow: true, token: 'tok-1' }),
    SMS_QUEUE: fakeSmsQueue(sent),
    TURNSTILE_SECRET: 'test-secret',
  };
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ success: true }))));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function req(body: Record<string, unknown>, opts: { env?: unknown } = {}) {
  __setEnv(('env' in opts ? opts.env : env) as Record<string, unknown>);
  const request = new Request(ROUTE_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { request, clientAddress: '203.0.113.1' } as never;
}

describe('POST /api/lead', () => {
  it('503s when no runtime env is present', async () => {
    const res = await POST(req(validBody(), { env: {} }));
    expect(res.status).toBe(503);
  });

  it('201s with channel=sms and enqueues exactly one queue message', async () => {
    const res = await POST(req(validBody()));
    const out = (await res.json()) as { outcome: string; channel: string; leadId: string };
    expect(res.status).toBe(201);
    expect(out).toMatchObject({ outcome: 'created', channel: 'sms' });
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ leadId: out.leadId, phoneE164: '+15165550100', allowToken: 'tok-1' });
  });

  it('202s with channel=callback for an East-End gated ZIP', async () => {
    const res = await POST(req(validBody({ zip: '11968' })));
    const out = (await res.json()) as { outcome: string; channel: string; reason: string };
    expect(res.status).toBe(202);
    expect(out).toMatchObject({ outcome: 'accepted', channel: 'callback', reason: 'east_end_gate' });
    expect(sent).toHaveLength(0);
  });

  it('202s with channel=callback when Turnstile does not verify', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ success: false }))));
    const res = await POST(req(validBody()));
    const out = (await res.json()) as { outcome: string; channel: string; reason: string };
    expect(res.status).toBe(202);
    expect(out).toMatchObject({ outcome: 'accepted', channel: 'callback', reason: 'turnstile_fallback' });
    expect(sent).toHaveLength(0);
  });

  it('202s with channel=callback when the DO denies the reservation', async () => {
    env.SMS_AUTHORITY = fakeSmsAuthority({ allow: false, reason: 'per_phone_window' });
    const res = await POST(req(validBody()));
    const out = (await res.json()) as { outcome: string; channel: string; reason: string };
    expect(res.status).toBe(202);
    expect(out).toMatchObject({ outcome: 'accepted', channel: 'callback', reason: 'per_phone_window' });
    expect(sent).toHaveLength(0);
  });

  it('400s on a malformed field', async () => {
    const res = await POST(req(validBody({ phoneE164: 'not-a-phone' })));
    const out = (await res.json()) as { outcome: string; field: string };
    expect(res.status).toBe(400);
    expect(out).toMatchObject({ outcome: 'malformed', field: 'phone' });
  });

  it('rejects GET', async () => {
    const res = await GET({} as never);
    expect(res.status).toBe(405);
  });
});
