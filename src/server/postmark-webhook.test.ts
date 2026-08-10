import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { SqlExecutor, SqlParam } from '../db/executor';
import { createRepositories } from '../db/repositories';
import { handlePostmarkWebhook, type PostmarkWebhookEvent } from './postmark-webhook';

const MIG_DIR = join(process.cwd(), 'migrations');
const MIGRATIONS = readdirSync(MIG_DIR)
  .filter((f) => /^\d+_.*\.sql$/.test(f))
  .sort()
  .map((f) => readFileSync(join(MIG_DIR, f), 'utf8'));

function nodeExecutor(db: InstanceType<typeof DatabaseSync>): SqlExecutor {
  return {
    async run(sql: string, params: SqlParam[] = []) { return { changes: Number(db.prepare(sql).run(...params).changes) }; },
    async get<T>(sql: string, params: SqlParam[] = []) { const r = db.prepare(sql).get(...params); return r === undefined ? undefined : (r as T); },
    async all<T>(sql: string, params: SqlParam[] = []) { return db.prepare(sql).all(...params) as T[]; },
  };
}

let repos: ReturnType<typeof createRepositories>;
let db: InstanceType<typeof DatabaseSync>;

const bounce = (over: Partial<PostmarkWebhookEvent> = {}): PostmarkWebhookEvent => ({
  RecordType: 'Bounce',
  ID: 4323,
  Type: 'HardBounce',
  Email: 'customer@example.com',
  Inactive: true,
  ...over,
});

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  for (const m of MIGRATIONS) db.exec(m);
  repos = createRepositories(nodeExecutor(db));
});

describe('Postmark bounce/complaint webhook', () => {
  it('suppresses the email on a hard bounce (Inactive: true)', async () => {
    const result = await handlePostmarkWebhook(bounce(), repos, { now: 10_000 });
    expect(result).toEqual({ processed: true, suppressed: true });
    expect(await repos.suppression.isSuppressed('email', 'customer@example.com')).toBe(true);
  });

  it('suppresses the email on a spam complaint (Inactive: true)', async () => {
    const event = bounce({ RecordType: 'SpamComplaint', ID: 9001, Type: 'SpamComplaint' });
    const result = await handlePostmarkWebhook(event, repos, { now: 10_000 });
    expect(result).toEqual({ processed: true, suppressed: true });
    expect(await repos.suppression.isSuppressed('email', 'customer@example.com')).toBe(true);
  });

  it('does NOT suppress a soft/transient bounce (Inactive: false)', async () => {
    const result = await handlePostmarkWebhook(bounce({ Type: 'SoftBounce', Inactive: false }), repos, { now: 10_000 });
    expect(result).toEqual({ processed: true, suppressed: false, reason: 'still_active' });
    expect(await repos.suppression.isSuppressed('email', 'customer@example.com')).toBe(false);
  });

  it('ignores non-actionable record types (e.g. Delivery, Open)', async () => {
    const result = await handlePostmarkWebhook(bounce({ RecordType: 'Delivery', Inactive: undefined }), repos, { now: 10_000 });
    expect(result).toEqual({ processed: true, suppressed: false, reason: 'not_actionable' });
    expect(await repos.suppression.isSuppressed('email', 'customer@example.com')).toBe(false);
  });

  it('is idempotent per Postmark record id', async () => {
    await handlePostmarkWebhook(bounce(), repos, { now: 10_000 });
    const second = await handlePostmarkWebhook(bounce(), repos, { now: 20_000 });
    expect(second).toEqual({ processed: false });
  });

  it('falls back to RecordType for the recorded reason when Postmark omits Type', async () => {
    const event = bounce({ Type: undefined });
    const result = await handlePostmarkWebhook(event, repos, { now: 10_000 });
    expect(result).toEqual({ processed: true, suppressed: true });
    const row = db
      .prepare(`SELECT keyword_matched FROM suppression WHERE channel = 'email' AND contact = ?`)
      .get('customer@example.com') as { keyword_matched: string };
    expect(row.keyword_matched).toBe('Bounce');
  });

  it('a later hard bounce still suppresses even if an earlier soft bounce for the same address did not', async () => {
    await handlePostmarkWebhook(bounce({ ID: 1, Type: 'SoftBounce', Inactive: false }), repos, { now: 10_000 });
    expect(await repos.suppression.isSuppressed('email', 'customer@example.com')).toBe(false);

    await handlePostmarkWebhook(bounce({ ID: 2, Type: 'HardBounce', Inactive: true }), repos, { now: 20_000 });
    expect(await repos.suppression.isSuppressed('email', 'customer@example.com')).toBe(true);
  });
});
