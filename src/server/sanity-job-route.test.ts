import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHmac } from 'node:crypto';
import type { D1Database } from '@cloudflare/workers-types';
import type { SqlParam } from '../db/executor';
import { POST, GET } from '../pages/api/webhooks/sanity-job';
import { __setEnv } from '../test/cf-workers-stub';

// Route-level test for the /api/webhooks/sanity-job adapter: signs a fixture
// body with the same Sanity webhook scheme (t=,v1=) that /api/webhooks/sanity-
// publish already uses, backed by a fake D1 over node:sqlite.

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

const SECRET = 'test-sanity-secret';
let db: InstanceType<typeof DatabaseSync>;
let env: { OP_STORE: D1Database; SANITY_WEBHOOK_SECRET?: string };

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  for (const m of MIGRATIONS) db.exec(m);
  env = { OP_STORE: fakeD1(db), SANITY_WEBHOOK_SECRET: SECRET };
});

function sign(body: string, ts = Math.floor(Date.now() / 1000)) {
  const v1 = createHmac('sha256', SECRET).update(`${ts}.${body}`).digest('base64url');
  return `t=${ts},v1=${v1}`;
}

function ctx(body: string, opts: { signature?: string; env?: unknown } = {}) {
  __setEnv(('env' in opts ? opts.env : env) as Record<string, unknown>);
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (opts.signature) headers['sanity-webhook-signature'] = opts.signature;
  const request = new Request('https://premiumroofsolutions.com/api/webhooks/sanity-job', {
    method: 'POST',
    headers,
    body,
  });
  return { request } as never;
}

describe('POST /api/webhooks/sanity-job', () => {
  it('503s when no runtime env is present', async () => {
    const res = await POST(ctx('{}', { env: {} }));
    expect(res.status).toBe(503);
  });

  it('503s when the webhook secret is not configured', async () => {
    const res = await POST(ctx('{}', { env: { OP_STORE: fakeD1(db) } }));
    expect(res.status).toBe(503);
  });

  it('401s on a missing signature', async () => {
    const res = await POST(ctx('{"_id":"job-1"}'));
    expect(res.status).toBe(401);
  });

  it('401s on an invalid signature', async () => {
    const res = await POST(ctx('{"_id":"job-1"}', { signature: 't=1,v1=deadbeef' }));
    expect(res.status).toBe(401);
  });

  it('processes a validly signed completion and writes a pending review_request', async () => {
    const body = JSON.stringify({ _id: 'job-1', customerContact: { phone: '+16315551212' } });
    const res = await POST(ctx(body, { signature: sign(body) }));
    const out = (await res.json()) as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(out.processed).toBe(true);
    expect(out.requestIds).toHaveLength(1);
  });

  it('skips without fabricating a contact when the job has none', async () => {
    const body = JSON.stringify({ _id: 'job-2', customerContact: {} });
    const res = await POST(ctx(body, { signature: sign(body) }));
    const out = (await res.json()) as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(out).toEqual({ processed: true, skipped: 'no_contact' });
  });

  it('is idempotent on redelivery of the same job id', async () => {
    const body = JSON.stringify({ _id: 'job-3', customerContact: { email: 'pat@example.com' } });
    const sig = sign(body);
    await POST(ctx(body, { signature: sig }));
    const res = await POST(ctx(body, { signature: sig }));
    const out = (await res.json()) as Record<string, unknown>;
    expect(out.processed).toBe(false);
  });

  it('400s on a malformed body even with a valid signature over it', async () => {
    const body = 'not json';
    const res = await POST(ctx(body, { signature: sign(body) }));
    expect(res.status).toBe(400);
  });

  it('400s when the signed body has no _id', async () => {
    const body = '{"customerContact":{"phone":"+16315551212"}}';
    const res = await POST(ctx(body, { signature: sign(body) }));
    expect(res.status).toBe(400);
  });

  it('rejects GET', async () => {
    const res = await GET({} as never);
    expect(res.status).toBe(405);
  });
});
