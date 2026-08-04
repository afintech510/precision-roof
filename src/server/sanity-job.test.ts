import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { SqlExecutor, SqlParam } from '../db/executor';
import { createRepositories } from '../db/repositories';
import { handleSanityJobWebhook } from './sanity-job';

const MIG_DIR = join(process.cwd(), 'migrations');
const MIGRATIONS = readdirSync(MIG_DIR)
  .filter((f) => /^\d+_.*\.sql$/.test(f))
  .sort()
  .map((f) => readFileSync(join(MIG_DIR, f), 'utf8'));

function nodeExecutor(db: InstanceType<typeof DatabaseSync>): SqlExecutor {
  return {
    async run(sql: string, params: SqlParam[] = []) {
      return { changes: Number(db.prepare(sql).run(...params).changes) };
    },
    async get<T>(sql: string, params: SqlParam[] = []) {
      const r = db.prepare(sql).get(...params);
      return r === undefined ? undefined : (r as T);
    },
    async all<T>(sql: string, params: SqlParam[] = []) {
      return db.prepare(sql).all(...params) as T[];
    },
  };
}

let db: InstanceType<typeof DatabaseSync>;
let repos: ReturnType<typeof createRepositories>;
let idCounter: number;

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  for (const m of MIGRATIONS) db.exec(m);
  repos = createRepositories(nodeExecutor(db));
  idCounter = 0;
});

const newId = () => `rr-${idCounter++}`;

function readRequests() {
  return db.prepare('SELECT job_id, customer_contact, channel, status FROM review_request ORDER BY channel').all();
}

describe('handleSanityJobWebhook', () => {
  it('writes one pending review_request per resolvable channel', async () => {
    const r = await handleSanityJobWebhook(
      { _id: 'job-1', customerContact: { phone: '+16315551212', email: 'pat@example.com' } },
      repos,
      { now: 1000, newId },
    );
    expect(r.processed).toBe(true);
    expect(r.requestIds).toHaveLength(2);
    expect(readRequests()).toEqual([
      { job_id: 'job-1', customer_contact: 'pat@example.com', channel: 'email', status: 'pending' },
      { job_id: 'job-1', customer_contact: '+16315551212', channel: 'sms', status: 'pending' },
    ]);
  });

  it('writes only the channel that resolves when the other is absent', async () => {
    const r = await handleSanityJobWebhook(
      { _id: 'job-2', customerContact: { phone: '+16315551212' } },
      repos,
      { now: 1000, newId },
    );
    expect(r.requestIds).toHaveLength(1);
    expect(readRequests()).toEqual([
      { job_id: 'job-2', customer_contact: '+16315551212', channel: 'sms', status: 'pending' },
    ]);
  });

  it('skips without fabricating a contact when neither phone nor email resolves', async () => {
    const r = await handleSanityJobWebhook({ _id: 'job-3', customerContact: {} }, repos, {
      now: 1000,
      newId,
    });
    expect(r).toEqual({ processed: true, skipped: 'no_contact' });
    expect(readRequests()).toEqual([]);
  });

  it('is idempotent on redelivery of the same job id, even with a different payload', async () => {
    await handleSanityJobWebhook(
      { _id: 'job-4', customerContact: { phone: '+16315551212' } },
      repos,
      { now: 1000, newId },
    );
    const dup = await handleSanityJobWebhook(
      { _id: 'job-4', customerContact: { phone: '+16315559999', email: 'new@example.com' } },
      repos,
      { now: 2000, newId },
    );
    expect(dup).toEqual({ processed: false });
    expect(readRequests()).toEqual([
      { job_id: 'job-4', customer_contact: '+16315551212', channel: 'sms', status: 'pending' },
    ]);
  });

  it('never re-fires for a job edited again after its first completion delivery', async () => {
    // Simulates a later Sanity edit (e.g. adding photos) redelivering the
    // webhook for the same job id with a fresh _rev — must not re-ask.
    await handleSanityJobWebhook({ _id: 'job-5', customerContact: {} }, repos, { now: 1000, newId });
    const second = await handleSanityJobWebhook(
      { _id: 'job-5', customerContact: { phone: '+16315551212' } },
      repos,
      { now: 5000, newId },
    );
    expect(second.processed).toBe(false);
    expect(readRequests()).toEqual([]);
  });
});
