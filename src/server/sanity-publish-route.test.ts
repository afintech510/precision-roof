import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHmac } from 'node:crypto';
import type { D1Database } from '@cloudflare/workers-types';
import type { SqlParam } from '../db/executor';
import { POST, GET } from '../pages/api/webhooks/sanity-publish';
import { __setEnv } from '../test/cf-workers-stub';
import { readPricingBlob, type KVStore } from './pricing-blob';

// Route-level test for the /api/webhooks/sanity-publish adapter: signs a
// fixture body with the same Sanity webhook scheme (t=,v1=) as
// sanity-job-route.test.ts, backed by a fake D1 over node:sqlite and an
// in-memory KV. Pricing rows come from the real content facade (sample
// data) exactly as the route does — no vendor keys needed.

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

function memKV(): KVStore & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    async get(k) {
      return store.get(k) ?? null;
    },
    async put(k, v) {
      store.set(k, v);
    },
  };
}

const SECRET = 'test-sanity-publish-secret';
let db: InstanceType<typeof DatabaseSync>;
let kv: ReturnType<typeof memKV>;
let env: { OP_STORE: D1Database; PRICING_KV: KVStore; SANITY_WEBHOOK_SECRET?: string };

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  for (const m of MIGRATIONS) db.exec(m);
  kv = memKV();
  env = { OP_STORE: fakeD1(db), PRICING_KV: kv, SANITY_WEBHOOK_SECRET: SECRET };
});

function sign(body: string, ts = Math.floor(Date.now() / 1000)) {
  const v1 = createHmac('sha256', SECRET).update(`${ts}.${body}`).digest('base64url');
  return `t=${ts},v1=${v1}`;
}

function ctx(body: string, opts: { signature?: string; env?: unknown } = {}) {
  __setEnv(('env' in opts ? opts.env : env) as Record<string, unknown>);
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (opts.signature) headers['sanity-webhook-signature'] = opts.signature;
  const request = new Request('https://premiumroofsolutions.com/api/webhooks/sanity-publish', {
    method: 'POST',
    headers,
    body,
  });
  return { request } as never;
}

describe('POST /api/webhooks/sanity-publish', () => {
  it('503s when no runtime env is present', async () => {
    const res = await POST(ctx('{}', { env: {} }));
    expect(res.status).toBe(503);
  });

  it('503s when PRICING_KV is not bound', async () => {
    const res = await POST(ctx('{}', { env: { OP_STORE: fakeD1(db) } }));
    expect(res.status).toBe(503);
  });

  it('503s when the webhook secret is not configured', async () => {
    const res = await POST(ctx('{}', { env: { OP_STORE: fakeD1(db), PRICING_KV: kv } }));
    expect(res.status).toBe(503);
  });

  it('401s on a missing signature', async () => {
    const res = await POST(ctx('{"_rev":"rev-1"}'));
    expect(res.status).toBe(401);
  });

  it('401s on an invalid signature', async () => {
    const res = await POST(ctx('{"_rev":"rev-1"}', { signature: 't=1,v1=deadbeef' }));
    expect(res.status).toBe(401);
  });

  it('400s on a malformed body even with a valid signature over it', async () => {
    const body = 'not json';
    const res = await POST(ctx(body, { signature: sign(body) }));
    expect(res.status).toBe(400);
  });

  it('400s when the signed body has no rev/_rev/_id', async () => {
    const body = '{"foo":"bar"}';
    const res = await POST(ctx(body, { signature: sign(body) }));
    expect(res.status).toBe(400);
  });

  it('processes a validly signed publish and materializes the pricing blob into KV', async () => {
    const body = JSON.stringify({ _rev: 'rev-1' });
    const res = await POST(ctx(body, { signature: sign(body) }));
    const out = (await res.json()) as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(out.processed).toBe(true);
    expect(typeof out.builtAt).toBe('number');
    expect((out.combos as number) > 0).toBe(true);

    const blob = await readPricingBlob(kv);
    expect(blob).not.toBeNull();
    expect(Object.keys(blob!.ranges).length).toBe(out.combos);
  });

  it('is idempotent on redelivery of the same rev', async () => {
    const body = JSON.stringify({ _rev: 'rev-2' });
    const sig = sign(body);
    await POST(ctx(body, { signature: sig }));
    const res = await POST(ctx(body, { signature: sig }));
    const out = (await res.json()) as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(out).toEqual({ processed: false });
  });

  it('falls back to the _id field when rev/_rev are absent', async () => {
    const body = JSON.stringify({ _id: 'doc-fallback' });
    const res = await POST(ctx(body, { signature: sign(body) }));
    const out = (await res.json()) as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(out.processed).toBe(true);
  });

  it('rejects GET', async () => {
    const res = await GET({} as never);
    expect(res.status).toBe(405);
  });
});
