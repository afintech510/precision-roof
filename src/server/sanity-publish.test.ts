import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHmac } from 'node:crypto';
import type { SqlExecutor, SqlParam } from '../db/executor';
import { createRepositories } from '../db/repositories';
import { handleSanityPublish, verifySanitySignature } from './sanity-publish';
import { readPricingBlob, type KVStore, type SourcePricingRow } from './pricing-blob';

const MIG_DIR = join(process.cwd(), 'migrations');
const MIGRATIONS = readdirSync(MIG_DIR).filter((f) => /^\d+_.*\.sql$/.test(f)).sort().map((f) => readFileSync(join(MIG_DIR, f), 'utf8'));

function nodeExecutor(db: InstanceType<typeof DatabaseSync>): SqlExecutor {
  return {
    async run(sql: string, params: SqlParam[] = []) { return { changes: Number(db.prepare(sql).run(...params).changes) }; },
    async get<T>(sql: string, params: SqlParam[] = []) { const r = db.prepare(sql).get(...params); return r === undefined ? undefined : (r as T); },
    async all<T>(sql: string, params: SqlParam[] = []) { return db.prepare(sql).all(...params) as T[]; },
  };
}
function memKV(): KVStore & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return { store, async get(k) { return store.get(k) ?? null; }, async put(k, v) { store.set(k, v); } };
}

const rows: SourcePricingRow[] = [
  { townSlug: 'huntington', serviceSlug: 'roof-replacement', band: 'medium', low: 18500, high: 28000 },
];

let repos: ReturnType<typeof createRepositories>;
let kv: ReturnType<typeof memKV>;
beforeEach(() => {
  const db = new DatabaseSync(':memory:');
  for (const m of MIGRATIONS) db.exec(m);
  repos = createRepositories(nodeExecutor(db));
  kv = memKV();
});

describe('handleSanityPublish', () => {
  it('materializes the blob into KV and records blob_built_at', async () => {
    const r = await handleSanityPublish({ rev: 'rev-1', rows }, { repos, kv, deps: { now: 5000 } });
    expect(r).toEqual({ processed: true, builtAt: 5000, combos: 1 });
    const blob = await readPricingBlob(kv);
    expect(blob?.builtAt).toBe(5000);
    expect(Object.keys(blob!.ranges)).toHaveLength(1);
  });

  it('is idempotent — a redelivered rev does not rebuild', async () => {
    await handleSanityPublish({ rev: 'rev-1', rows }, { repos, kv, deps: { now: 5000 } });
    const dup = await handleSanityPublish({ rev: 'rev-1', rows: [] }, { repos, kv, deps: { now: 9000 } });
    expect(dup).toEqual({ processed: false });
    // blob untouched by the duplicate
    expect((await readPricingBlob(kv))?.builtAt).toBe(5000);
  });
});

describe('verifySanitySignature', () => {
  const secret = 'whsec_test';
  const body = '{"_rev":"abc"}';
  const sign = (ts: number, b: string) =>
    createHmac('sha256', secret).update(`${ts}.${b}`).digest('base64url');

  it('accepts a valid, fresh signature', async () => {
    const ts = 1_000_000; // seconds
    const header = `t=${ts},v1=${sign(ts, body)}`;
    const r = await verifySanitySignature(secret, header, body, ts * 1000 + 1000);
    expect(r).toEqual({ ok: true });
  });

  it('rejects a bad signature', async () => {
    const ts = 1_000_000;
    const header = `t=${ts},v1=deadbeef`;
    const r = await verifySanitySignature(secret, header, body, ts * 1000);
    expect(r).toEqual({ ok: false, reason: 'bad_signature' });
  });

  it('rejects a tampered body', async () => {
    const ts = 1_000_000;
    const header = `t=${ts},v1=${sign(ts, body)}`;
    const r = await verifySanitySignature(secret, header, '{"_rev":"EVIL"}', ts * 1000);
    expect(r).toEqual({ ok: false, reason: 'bad_signature' });
  });

  it('rejects a stale timestamp outside the window', async () => {
    const ts = 1_000_000;
    const header = `t=${ts},v1=${sign(ts, body)}`;
    const r = await verifySanitySignature(secret, header, body, ts * 1000 + 10 * 60 * 1000);
    expect(r).toEqual({ ok: false, reason: 'stale' });
  });

  it('flags missing + malformed headers', async () => {
    expect(await verifySanitySignature(secret, null, body, 1)).toEqual({ ok: false, reason: 'missing' });
    expect(await verifySanitySignature(secret, 't=notanumber,v1=x', body, 1)).toEqual({ ok: false, reason: 'malformed' });
  });
});
