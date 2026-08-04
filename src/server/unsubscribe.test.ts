import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SqlExecutor, SqlParam } from '../db/executor';
import { createRepositories } from '../db/repositories';
import { mintUnsubscribeToken, verifyUnsubscribeToken, authorizeUnsubscribe } from './unsubscribe';

const UP = readFileSync(join(process.cwd(), 'migrations', '0001_init_operational_store.sql'), 'utf8');

function nodeExecutor(db: InstanceType<typeof DatabaseSync>): SqlExecutor {
  return {
    async run(sql: string, params: SqlParam[] = []) {
      const r = db.prepare(sql).run(...params);
      return { changes: Number(r.changes) };
    },
    async get<T>(sql: string, params: SqlParam[] = []) {
      const row = db.prepare(sql).get(...params);
      return (row === undefined ? undefined : (row as T));
    },
    async all<T>(sql: string, params: SqlParam[] = []) {
      return db.prepare(sql).all(...params) as T[];
    },
  };
}

const SECRET = 'test-unsubscribe-secret';
let repos: ReturnType<typeof createRepositories>;

beforeEach(() => {
  const db = new DatabaseSync(':memory:');
  db.exec(UP);
  repos = createRepositories(nodeExecutor(db));
});

describe('mint/verifyUnsubscribeToken', () => {
  it('round-trips a valid token', async () => {
    const token = await mintUnsubscribeToken('pat@example.com', { secret: SECRET, now: 1000 });
    const v = await verifyUnsubscribeToken(token, SECRET, 1001);
    expect(v).toEqual({ ok: true, claims: { email: 'pat@example.com', exp: 1000 + 180 * 24 * 60 * 60 * 1000 } });
  });

  it('rejects a tampered signature', async () => {
    const token = await mintUnsubscribeToken('pat@example.com', { secret: SECRET, now: 1000 });
    const tampered = token.slice(0, -2) + 'zz';
    const v = await verifyUnsubscribeToken(tampered, SECRET, 1001);
    expect(v).toEqual({ ok: false, reason: 'bad_signature' });
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await mintUnsubscribeToken('pat@example.com', { secret: SECRET, now: 1000 });
    const v = await verifyUnsubscribeToken(token, 'wrong-secret', 1001);
    expect(v).toEqual({ ok: false, reason: 'bad_signature' });
  });

  it('rejects an expired token', async () => {
    const token = await mintUnsubscribeToken('pat@example.com', { secret: SECRET, now: 1000, ttlMs: 500 });
    const v = await verifyUnsubscribeToken(token, SECRET, 1600);
    expect(v).toEqual({ ok: false, reason: 'expired' });
  });

  it('rejects a malformed token', async () => {
    expect(await verifyUnsubscribeToken('not-a-token', SECRET, 1001)).toEqual({ ok: false, reason: 'malformed' });
    expect(await verifyUnsubscribeToken(undefined, SECRET, 1001)).toEqual({ ok: false, reason: 'malformed' });
  });
});

describe('authorizeUnsubscribe', () => {
  it('suppresses the email on a valid token', async () => {
    const token = await mintUnsubscribeToken('pat@example.com', { secret: SECRET, now: 1000 });
    expect(await repos.suppression.isSuppressed('email', 'pat@example.com')).toBe(false);

    const outcome = await authorizeUnsubscribe(token, repos, { secret: SECRET, now: 1001 });
    expect(outcome).toEqual({ status: 'ok', email: 'pat@example.com' });
    expect(await repos.suppression.isSuppressed('email', 'pat@example.com')).toBe(true);
  });

  it('is idempotent — clicking the link twice is harmless', async () => {
    const token = await mintUnsubscribeToken('pat@example.com', { secret: SECRET, now: 1000 });
    await authorizeUnsubscribe(token, repos, { secret: SECRET, now: 1001 });
    const second = await authorizeUnsubscribe(token, repos, { secret: SECRET, now: 1002 });
    expect(second.status).toBe('ok');
    expect(await repos.suppression.isSuppressed('email', 'pat@example.com')).toBe(true);
  });

  it('does not suppress on an invalid token', async () => {
    const outcome = await authorizeUnsubscribe('garbage', repos, { secret: SECRET, now: 1001 });
    expect(outcome.status).toBe('invalid');
  });
});
