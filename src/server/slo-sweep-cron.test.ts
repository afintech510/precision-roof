import { describe, it, expect, afterEach, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { D1Database } from '@cloudflare/workers-types';
import type { SqlParam } from '../db/executor';
import { createRepositories } from '../db/repositories';
import { SMS_AUTHORITY_SCHEMA, reserveSmsSend, claimSmsSend } from './sms-authority';
import type { SmsAuthorityStub } from './sms-dispatch';

// Adapter test for the slo-sweep Cron Trigger's "never fail closed" guard
// (spec §3.2): a missing SMS_AUTHORITY binding or Twilio secret must skip the
// tick without touching D1, not throw. The sweep itself is covered by
// slo-sweep.test.ts against the pure core — this only exercises the adapter's
// wiring/guard, using a D1 stub that throws on any query so a guard bypass
// would fail loudly.
function throwingD1(): D1Database {
  return {
    prepare() {
      throw new Error('D1 should not be touched when config is missing');
    },
  } as unknown as D1Database;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('slo-sweep-cron — missing config guard', () => {
  it('skips without touching D1 when SMS_AUTHORITY is absent', async () => {
    const { scheduled } = await import('./slo-sweep-cron');
    const result = await scheduled({
      OP_STORE: throwingD1(),
      TWILIO_ACCOUNT_SID: 'AC1', TWILIO_AUTH_TOKEN: 'tok', TWILIO_FROM_NUMBER: '+15165550199',
    } as never);
    expect(result).toBeUndefined();
  });

  it('skips without touching D1 when Twilio secrets are absent', async () => {
    const { scheduled } = await import('./slo-sweep-cron');
    const result = await scheduled({
      OP_STORE: throwingD1(),
      SMS_AUTHORITY: { idFromName: () => 'id', get: () => ({}) },
    } as never);
    expect(result).toBeUndefined();
  });

  it('proceeds (touches D1) once all required config is present', async () => {
    const { scheduled } = await import('./slo-sweep-cron');
    await expect(
      scheduled({
        OP_STORE: throwingD1(),
        SMS_AUTHORITY: { idFromName: () => 'id', get: () => ({}) },
        TWILIO_ACCOUNT_SID: 'AC1', TWILIO_AUTH_TOKEN: 'tok', TWILIO_FROM_NUMBER: '+15165550199',
      } as never),
    ).rejects.toThrow('D1 should not be touched when config is missing');
  });
});

// Full happy-path adapter test: real D1-shaped OP_STORE, a real DO-authority
// core over its own sqlite-backed storage, and a stubbed Twilio fetch — the
// only way to exercise the adapter's `newId: () => crypto.randomUUID()`
// wiring (sms-dispatch.ts calls it when recording the message_log row), which
// the guard-only tests above never reach because their D1 stub throws first.
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

describe('slo-sweep-cron scheduled() — full happy path', () => {
  it('reserves, sends, and records via crypto.randomUUID() ids when all config + DO authority allow it', async () => {
    const opDb = new DatabaseSync(':memory:');
    for (const m of MIGRATIONS) opDb.exec(m);
    const repos = createRepositories({
      async run(sql, params = []) {
        const r = opDb.prepare(sql).run(...(params as SqlParam[]));
        return { changes: Number(r.changes) };
      },
      async get<T>(sql: string, params: SqlParam[] = []) {
        const row = opDb.prepare(sql).get(...params);
        return (row === undefined ? undefined : (row as T));
      },
      async all<T>(sql: string, params: SqlParam[] = []) {
        return opDb.prepare(sql).all(...params) as T[];
      },
    });
    await repos.lead.insert({
      id: 'lead-1', createdAt: Date.now(), name: 'Pat Doe', phoneE164: '+15165550100',
      zip: '11743', service: 'roof-repair', advertisingStatus: 'active', smsSuppressedReason: null,
    });

    const doDb = new DatabaseSync(':memory:');
    doDb.exec(SMS_AUTHORITY_SCHEMA);
    const doStorage = {
      async run(sql: string, params: SqlParam[] = []) {
        return { changes: Number(doDb.prepare(sql).run(...params).changes) };
      },
      async get<T>(sql: string, params: SqlParam[] = []) {
        const r = doDb.prepare(sql).get(...params);
        return r === undefined ? undefined : (r as T);
      },
      async all<T>(sql: string, params: SqlParam[] = []) {
        return doDb.prepare(sql).all(...params) as T[];
      },
    };
    const authDeps = (now: number) => ({ now, newId: () => `tok-${now}`, isSuppressed: async () => false });
    const authority: SmsAuthorityStub = {
      reserve: (phone, leadId) => reserveSmsSend({ phoneE164: phone, leadId }, doStorage, authDeps(Date.now())),
      claimSend: (leadId, phone) => claimSmsSend({ leadId, phoneE164: phone }, doStorage, authDeps(Date.now())),
    };

    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ sid: 'SM123' }), { status: 201 })));

    const { scheduled } = await import('./slo-sweep-cron');
    const result = await scheduled({
      OP_STORE: fakeD1(opDb),
      SMS_AUTHORITY: { idFromName: () => 'id', get: () => authority },
      TWILIO_ACCOUNT_SID: 'AC1', TWILIO_AUTH_TOKEN: 'tok', TWILIO_FROM_NUMBER: '+15165550199',
    } as never);

    expect(result).toEqual({ swept: 1, sent: 1, skipped: [] });
    const lead = await repos.lead.getById('lead-1');
    expect(lead?.status).toBe('sms_sent');
    const rows = opDb.prepare('SELECT id FROM message_log').all() as Array<{ id: string }>;
    expect(rows).toHaveLength(1);
    // Proof the adapter's own `newId: () => crypto.randomUUID()` ran (not the
    // authority's separate deps) — a real UUID, not the `tok-*` authority ids.
    expect(rows[0].id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
});
