import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { D1Database, Queue } from '@cloudflare/workers-types';
import type { SqlParam } from '../db/executor';
import { POST, GET } from '../pages/api/lead';
import { __setEnv } from '../test/cf-workers-stub';
import type { LeadAuthorityBinding, ReserveResult } from './lead-authority';
import type { SmsDispatchJob } from './lead-dispatch';

// Route-level test for the /api/lead adapter: no Turnstile secret configured
// (so verification is skipped/unverified — proving the anti-spam `turnstile_
// fallback` fail-closed-on-send path), backed by a fake D1 over node:sqlite
// (same schema migrations as prod), and fake LEAD_AUTHORITY/LEAD_SMS_QUEUE
// bindings standing in for the not-yet-wired real ones.

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

/** A fake LEAD_AUTHORITY whose `.reserve` outcome is scripted per test. */
function fakeAuthority(reserve: (input: unknown) => Promise<ReserveResult>): LeadAuthorityBinding {
  return {
    idFromName: (name: string) => name,
    get: () => ({ reserve }),
  };
}

function fakeQueue(sink: SmsDispatchJob[]): Queue<SmsDispatchJob> {
  return {
    async send(message: SmsDispatchJob) {
      sink.push(message);
      return { metadata: { metrics: { backlogCount: 0, backlogBytes: 0 } } };
    },
  } as unknown as Queue<SmsDispatchJob>;
}

const ROUTE_URL = 'https://premiumroofsolutions.com/api/lead';
let db: InstanceType<typeof DatabaseSync>;
let env: Record<string, unknown>;

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  for (const m of MIGRATIONS) db.exec(m);
  env = { OP_STORE: fakeD1(db) };
});

const validBody = {
  name: 'Pat Doe',
  phone: '(516) 555-0142',
  zip: '11743',
  service: 'roof-replacement',
  consentText: 'I agree to receive texts about my request.',
  consentVersion: 'v1',
};

function ctx(body: unknown, opts: { env?: unknown } = {}) {
  __setEnv(('env' in opts ? opts.env : env) as Record<string, unknown>);
  const request = new Request(ROUTE_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'user-agent': 'vitest' },
    body: JSON.stringify(body),
  });
  return { request, clientAddress: '203.0.113.9' } as never;
}

async function call(body: unknown, opts: { env?: unknown } = {}) {
  const res = await POST(ctx(body, opts));
  return { status: res.status, json: (await res.json()) as Record<string, unknown> };
}

describe('POST /api/lead', () => {
  it('503s when no runtime env is present', async () => {
    const { status } = await call(validBody, { env: {} });
    expect(status).toBe(503);
  });

  it('400s on malformed input (e.g. a non-NANP phone) without writing a lead', async () => {
    const { status, json } = await call({ ...validBody, phone: '123' });
    expect(status).toBe(400);
    expect(json.outcome).toBe('malformed');
    expect(json.reason).toBe('invalid_phone');
  });

  it('201s and records the lead as turnstile_fallback when Turnstile is unverified (no secret configured)', async () => {
    const { status, json } = await call(validBody);
    expect(status).toBe(201);
    expect(json.outcome).toBe('created');
    expect(json.dispatch).toBe('suppressed_policy');
  });

  it('201s a gated East-End ZIP as suppressed_policy, independent of Turnstile', async () => {
    const { status, json } = await call({ ...validBody, zip: '11968' });
    expect(status).toBe(201);
    expect(json.dispatch).toBe('suppressed_policy');
  });

  it('rejects GET', async () => {
    const res = await GET({} as never);
    expect(res.status).toBe(405);
  });
});

describe('POST /api/lead — with Turnstile actually verified', () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function stubVerifiedFetch() {
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({ success: true }))) as unknown as typeof fetch;
  }

  it('leaves dispatch not_configured when verified but no DO/Queue binding exists', async () => {
    stubVerifiedFetch();
    const { status, json } = await call(
      { ...validBody, turnstileToken: 'present' },
      { env: { ...env, TURNSTILE_SECRET: 's' } },
    );
    expect(status).toBe(201);
    expect(json.dispatch).toBe('not_configured');
  });

  it('reserves via the DO and enqueues to the Queue when both bindings are present and the reservation is allowed', async () => {
    stubVerifiedFetch();
    const sink: SmsDispatchJob[] = [];
    const authority = fakeAuthority(async () => ({ allow: true, token: 'tok-1' }));
    const queue = fakeQueue(sink);
    const { status, json } = await call(
      { ...validBody, turnstileToken: 'present' },
      { env: { ...env, TURNSTILE_SECRET: 's', LEAD_AUTHORITY: authority, LEAD_SMS_QUEUE: queue } },
    );
    expect(status).toBe(201);
    expect(json.dispatch).toBe('queued');
    expect(sink).toEqual([{ leadId: json.leadId, phoneE164: '+15165550142' }]);
  });

  it('does not enqueue when the DO denies the reservation', async () => {
    stubVerifiedFetch();
    const sink: SmsDispatchJob[] = [];
    const authority = fakeAuthority(async () => ({ allow: false, reason: 'suppressed' }));
    const queue = fakeQueue(sink);
    const { json } = await call(
      { ...validBody, turnstileToken: 'present' },
      { env: { ...env, TURNSTILE_SECRET: 's', LEAD_AUTHORITY: authority, LEAD_SMS_QUEUE: queue } },
    );
    expect(json.dispatch).toBe('suppressed_policy');
    expect(sink).toEqual([]);
  });
});
