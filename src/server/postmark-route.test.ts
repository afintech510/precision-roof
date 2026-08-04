import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { D1Database } from '@cloudflare/workers-types';
import type { SqlParam } from '../db/executor';
import { POST, GET } from '../pages/api/webhooks/postmark';
import { createRepositories } from '../db/repositories';
import { d1Executor } from '../db/executor';
import { __setEnv } from '../test/cf-workers-stub';

// Route-level test for the /api/webhooks/postmark adapter: posts a fixture
// Postmark bounce/complaint payload with the configured Basic Auth header,
// backed by a fake D1 over node:sqlite (same schema migrations as prod).

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

const SECRET = 'webhooks:test-postmark-secret';
const AUTH_HEADER = `Basic ${btoa(SECRET)}`;
let db: InstanceType<typeof DatabaseSync>;
let env: Record<string, unknown>;

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  for (const m of MIGRATIONS) db.exec(m);
  env = {
    OP_STORE: fakeD1(db),
    POSTMARK_WEBHOOK_SECRET: SECRET,
  };
});

function ctx(body: string, opts: { auth?: string | null; env?: unknown } = {}) {
  __setEnv(('env' in opts ? opts.env : env) as Record<string, unknown>);
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  const auth = 'auth' in opts ? opts.auth : AUTH_HEADER;
  if (auth) headers['authorization'] = auth;
  const request = new Request('https://premiumroofsolutions.com/api/webhooks/postmark', {
    method: 'POST',
    headers,
    body,
  });
  return { request } as never;
}

const bounceBody = (over: Record<string, unknown> = {}) => JSON.stringify({
  RecordType: 'Bounce',
  ID: 4323,
  Type: 'HardBounce',
  Email: 'customer@example.com',
  Inactive: true,
  ...over,
});

describe('POST /api/webhooks/postmark', () => {
  it('503s when no runtime env is present', async () => {
    const res = await POST(ctx('{}', { env: {} }));
    expect(res.status).toBe(503);
  });

  it('503s when the webhook secret is not configured', async () => {
    const res = await POST(ctx('{}', { env: { OP_STORE: fakeD1(db) } }));
    expect(res.status).toBe(503);
  });

  it('401s on a missing Authorization header', async () => {
    const res = await POST(ctx(bounceBody(), { auth: null }));
    expect(res.status).toBe(401);
  });

  it('401s on a wrong credential', async () => {
    const res = await POST(ctx(bounceBody(), { auth: `Basic ${btoa('wrong:creds')}` }));
    expect(res.status).toBe(401);
  });

  it('400s on a malformed body even with valid auth', async () => {
    const res = await POST(ctx('not json'));
    expect(res.status).toBe(400);
  });

  it('400s when required fields are missing', async () => {
    const res = await POST(ctx(JSON.stringify({ RecordType: 'Bounce' })));
    expect(res.status).toBe(400);
  });

  it('suppresses the email on a validly authenticated hard bounce', async () => {
    const res = await POST(ctx(bounceBody()));
    const out = (await res.json()) as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(out).toEqual({ processed: true, suppressed: true });

    const repos = createRepositories(d1Executor(env.OP_STORE as never));
    expect(await repos.suppression.isSuppressed('email', 'customer@example.com')).toBe(true);
  });

  it('does not suppress a soft bounce', async () => {
    const res = await POST(ctx(bounceBody({ Type: 'SoftBounce', Inactive: false })));
    const out = (await res.json()) as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(out).toEqual({ processed: true, suppressed: false, reason: 'still_active' });
  });

  it('is idempotent on redelivery of the same record id', async () => {
    await POST(ctx(bounceBody()));
    const res = await POST(ctx(bounceBody()));
    const out = (await res.json()) as Record<string, unknown>;
    expect(out).toEqual({ processed: false });
  });

  it('rejects GET', async () => {
    const res = await GET({} as never);
    expect(res.status).toBe(405);
  });
});
