import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { D1Database } from '@cloudflare/workers-types';
import type { SqlParam } from '../db/executor';
import { POST, GET } from '../pages/api/webhooks/calcom';
import { computeCalcomSignature } from './calcom-signature';
import { __setEnv } from '../test/cf-workers-stub';

// Route-level test for the /api/webhooks/calcom adapter: signs a fixture body
// with the same secret the route expects, backed by a fake D1 over node:sqlite
// (same schema migrations as prod) so the whole thin-adapter path is exercised
// without Miniflare or vendor keys.

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

const SECRET = 'test-calcom-secret';
let db: InstanceType<typeof DatabaseSync>;
let env: { OP_STORE: D1Database; CALCOM_WEBHOOK_SECRET?: string };

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  for (const m of MIGRATIONS) db.exec(m);
  env = { OP_STORE: fakeD1(db), CALCOM_WEBHOOK_SECRET: SECRET };
});

function ctx(body: string, opts: { signature?: string; env?: unknown } = {}) {
  __setEnv(('env' in opts ? opts.env : env) as Record<string, unknown>);
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (opts.signature) headers['x-cal-signature-256'] = opts.signature;
  const request = new Request('https://premiumroofsolutions.com/api/webhooks/calcom', {
    method: 'POST',
    headers,
    body,
  });
  return { request } as never;
}

describe('POST /api/webhooks/calcom', () => {
  it('503s when no runtime env is present', async () => {
    const res = await POST(ctx('{}', { env: {} }));
    expect(res.status).toBe(503);
  });

  it('503s when the webhook secret is not configured', async () => {
    const res = await POST(ctx('{}', { env: { OP_STORE: fakeD1(db) } }));
    expect(res.status).toBe(503);
  });

  it('401s on a missing signature', async () => {
    const res = await POST(ctx('{"triggerEvent":"BOOKING_CREATED","payload":{"uid":"CAL-1"}}'));
    expect(res.status).toBe(401);
  });

  it('401s on an invalid signature', async () => {
    const res = await POST(
      ctx('{"triggerEvent":"BOOKING_CREATED","payload":{"uid":"CAL-1"}}', { signature: 'deadbeef' }),
    );
    expect(res.status).toBe(401);
  });

  it('processes a validly signed booking and creates a walk-up lead', async () => {
    const body = JSON.stringify({
      triggerEvent: 'BOOKING_CREATED',
      payload: { uid: 'CAL-1', startTime: '2026-09-01T15:00:00Z', attendees: [{ name: 'Pat D' }] },
    });
    const sig = await computeCalcomSignature(SECRET, body);
    const res = await POST(ctx(body, { signature: sig }));
    const out = (await res.json()) as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(out.processed).toBe(true);
    expect(out.source).toBe('booking_direct');
  });

  it('is idempotent on redelivery of the same signed body', async () => {
    const body = JSON.stringify({ triggerEvent: 'BOOKING_CREATED', payload: { uid: 'CAL-2' } });
    const sig = await computeCalcomSignature(SECRET, body);
    await POST(ctx(body, { signature: sig }));
    const res = await POST(ctx(body, { signature: sig }));
    const out = (await res.json()) as Record<string, unknown>;
    expect(out.processed).toBe(false);
  });

  it('400s on a malformed body even with a valid signature over it', async () => {
    const body = 'not json';
    const sig = await computeCalcomSignature(SECRET, body);
    const res = await POST(ctx(body, { signature: sig }));
    expect(res.status).toBe(400);
  });

  it('rejects GET', async () => {
    const res = await GET({} as never);
    expect(res.status).toBe(405);
  });
});
