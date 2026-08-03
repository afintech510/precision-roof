import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { D1Database } from '@cloudflare/workers-types';
import type { SqlParam } from '../db/executor';
import { POST, GET } from '../pages/api/webhooks/twilio';
import { computeTwilioSignature } from './twilio-signature';

// Route-level test for the /api/webhooks/twilio adapter: signs a fixture form
// body with the same auth token the route expects, backed by a fake D1 over
// node:sqlite (same schema migrations as prod).

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

const AUTH_TOKEN = 'test-twilio-token';
const ROUTE_URL = 'https://premiumroofsolutions.com/api/webhooks/twilio';
let db: InstanceType<typeof DatabaseSync>;
let env: { OP_STORE: D1Database; TWILIO_AUTH_TOKEN?: string };

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  for (const m of MIGRATIONS) db.exec(m);
  env = { OP_STORE: fakeD1(db), TWILIO_AUTH_TOKEN: AUTH_TOKEN };
});

async function ctx(params: Record<string, string>, opts: { locals?: unknown; signature?: string } = {}) {
  const body = new URLSearchParams(params).toString();
  const signature = opts.signature ?? (await computeTwilioSignature(AUTH_TOKEN, ROUTE_URL, params));
  const request = new Request(ROUTE_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', 'x-twilio-signature': signature },
    body,
  });
  const locals = 'locals' in opts ? opts.locals : { runtime: { env } };
  return { request, locals } as never;
}

describe('POST /api/webhooks/twilio', () => {
  it('503s when no runtime env is present', async () => {
    const res = await POST(await ctx({ MessageSid: 'SM1', MessageStatus: 'sent' }, { locals: {} }));
    expect(res.status).toBe(503);
  });

  it('503s when TWILIO_AUTH_TOKEN is not configured', async () => {
    const res = await POST(
      await ctx({ MessageSid: 'SM1', MessageStatus: 'sent' }, { locals: { runtime: { env: { OP_STORE: fakeD1(db) } } } }),
    );
    expect(res.status).toBe(503);
  });

  it('401s on an invalid signature', async () => {
    const res = await POST(await ctx({ MessageSid: 'SM1', MessageStatus: 'sent' }, { signature: 'bogus==' }));
    expect(res.status).toBe(401);
  });

  it('processes a validly signed status callback', async () => {
    const res = await POST(await ctx({ MessageSid: 'SM1', MessageStatus: 'delivered' }));
    const out = (await res.json()) as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(out).toEqual({ processed: true, applied: false }); // no matching message_log row yet — still processed once
  });

  it('is idempotent on redelivery of the same status', async () => {
    await POST(await ctx({ MessageSid: 'SM2', MessageStatus: 'sent' }));
    const res = await POST(await ctx({ MessageSid: 'SM2', MessageStatus: 'sent' }));
    const out = (await res.json()) as Record<string, unknown>;
    expect(out).toEqual({ processed: false, applied: false });
  });

  it('processes a validly signed inbound STOP', async () => {
    const res = await POST(await ctx({ MessageSid: 'SM3', From: '+15165550100', Body: 'STOP' }));
    const out = (await res.json()) as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(out).toEqual({ processed: true, action: 'suppressed' });
  });

  it('400s when the body is neither a status callback nor an inbound message', async () => {
    const res = await POST(await ctx({ MessageSid: 'SM4' }));
    expect(res.status).toBe(400);
  });

  it('rejects GET', async () => {
    const res = await GET({} as never);
    expect(res.status).toBe(405);
  });
});
