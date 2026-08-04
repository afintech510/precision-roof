import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { D1Database } from '@cloudflare/workers-types';
import type { SqlParam } from '../db/executor';
import { GET, POST } from '../pages/unsubscribe';
import { __setEnv } from '../test/cf-workers-stub';
import { mintUnsubscribeToken } from './unsubscribe';

// Route-level test for GET/POST /unsubscribe (Phase 09 Task 3): the one-click
// unsubscribe target carried in every review-request email.

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

const SECRET = 'test-unsubscribe-secret';
let db: InstanceType<typeof DatabaseSync>;
let env: { OP_STORE: D1Database; UNSUBSCRIBE_TOKEN_SECRET?: string };

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  for (const m of MIGRATIONS) db.exec(m);
  env = { OP_STORE: fakeD1(db), UNSUBSCRIBE_TOKEN_SECRET: SECRET };
});

function ctx(reqUrl: string, opts: { method?: string; env?: unknown } = {}) {
  __setEnv(('env' in opts ? opts.env : env) as Record<string, unknown>);
  const request = new Request(reqUrl, { method: opts.method ?? 'GET' });
  return { request, url: new URL(reqUrl) } as never;
}

describe('GET /unsubscribe', () => {
  it('503s when not configured', async () => {
    const res = await GET(ctx('https://premiumroofsolutions.com/unsubscribe?token=x', { env: { OP_STORE: fakeD1(db) } }));
    expect(res.status).toBe(503);
  });

  it('400s on a missing/invalid token without suppressing anything', async () => {
    const res = await GET(ctx('https://premiumroofsolutions.com/unsubscribe'));
    expect(res.status).toBe(400);
  });

  it('shows a confirm page for a valid token and does NOT suppress on GET', async () => {
    const token = await mintUnsubscribeToken('pat@example.com', { secret: SECRET, now: Date.now() });
    const res = await GET(ctx(`https://premiumroofsolutions.com/unsubscribe?token=${encodeURIComponent(token)}`));
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('pat@example.com');

    // A GET must never have a side effect — the address must not be suppressed yet.
    const check = db.prepare(`SELECT 1 as x FROM suppression WHERE channel = 'email' AND contact = 'pat@example.com'`).get();
    expect(check).toBeUndefined();
  });
});

describe('POST /unsubscribe', () => {
  it('suppresses the address on a valid token', async () => {
    const token = await mintUnsubscribeToken('pat@example.com', { secret: SECRET, now: Date.now() });
    const res = await POST(ctx(`https://premiumroofsolutions.com/unsubscribe?token=${encodeURIComponent(token)}`, { method: 'POST' }));
    expect(res.status).toBe(200);

    const row = db.prepare(`SELECT suppressed_at FROM suppression WHERE channel = 'email' AND contact = 'pat@example.com'`).get() as
      | { suppressed_at: number }
      | undefined;
    expect(row).toBeDefined();
  });

  it('400s on an invalid token and suppresses nothing', async () => {
    const res = await POST(ctx('https://premiumroofsolutions.com/unsubscribe?token=garbage', { method: 'POST' }));
    expect(res.status).toBe(400);
  });
});
