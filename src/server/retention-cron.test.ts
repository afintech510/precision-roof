import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { D1Database } from '@cloudflare/workers-types';
import type { SqlParam } from '../db/executor';
import { createRepositories } from '../db/repositories';
import { DAY_MS } from './retention';
import { scheduled } from './retention-cron';

// Adapter test for the retention Cron Trigger: unlike its sibling adapters
// (slo-sweep-cron, review-request-cron) this one has no missing-secret guard
// to exercise — it unconditionally wires env.OP_STORE into d1Executor +
// createRepositories and calls the pure runRetentionSweep core (already
// covered by retention.test.ts). What's actually worth verifying at the
// adapter layer is that wiring itself: a real D1-shaped binding, through the
// real executor, reaches the real repos and prunes a row past the default
// 90-day webhook_events threshold.

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

let db: InstanceType<typeof DatabaseSync>;

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  for (const m of MIGRATIONS) db.exec(m);
});

describe('retention-cron scheduled()', () => {
  it('wires env.OP_STORE through to a real sweep that prunes past the default 90-day webhook_events window', async () => {
    const repos = createRepositories({
      async run(sql, params = []) {
        const r = db.prepare(sql).run(...(params as SqlParam[]));
        return { changes: Number(r.changes) };
      },
      async get<T>(sql: string, params: SqlParam[] = []) {
        const row = db.prepare(sql).get(...params);
        return (row === undefined ? undefined : (row as T));
      },
      async all<T>(sql: string, params: SqlParam[] = []) {
        return db.prepare(sql).all(...params) as T[];
      },
    });
    // retention-cron.ts calls the real Date.now() internally (no injectable
    // clock), so anchor the fixture rows to it rather than a fake "now".
    const now = Date.now();
    await repos.webhookEvents.claim('old:done', 'twilio', now - 100 * DAY_MS);
    await repos.webhookEvents.claim('recent:done', 'twilio', now - 1 * DAY_MS);

    await scheduled({ OP_STORE: fakeD1(db) } as never);

    const rows = db.prepare('SELECT idempotency_key FROM webhook_events').all();
    expect(rows).toEqual([{ idempotency_key: 'recent:done' }]);
  });
});
