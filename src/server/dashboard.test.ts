import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { SqlExecutor, SqlParam } from '../db/executor';
import { createRepositories } from '../db/repositories';
import {
  viewLead,
  listFailedSends,
  mintResendToken,
  verifyResendToken,
  authorizeResend,
  DEFAULT_RESEND_TTL_MS,
} from './dashboard';

// Load every forward migration (0001, 0002, …) in order so the schema matches prod.
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

let db: InstanceType<typeof DatabaseSync>;
let repos: ReturnType<typeof createRepositories>;
let ids: number;
const deps = () => ({ now: 1_000_000, newId: () => `id-${++ids}` });
const op = { operatorId: 'op-adam', ip: '203.0.113.7' };
const SECRET = 'test-signing-secret';

const accessRows = () =>
  db.prepare('SELECT operator_id, action, lead_id, ip FROM operator_access_log ORDER BY id').all() as Array<{
    operator_id: string; action: string; lead_id: string | null; ip: string | null;
  }>;

beforeEach(async () => {
  db = new DatabaseSync(':memory:');
  for (const m of MIGRATIONS) db.exec(m);
  repos = createRepositories(nodeExecutor(db));
  ids = 0;
  await repos.lead.insert({
    id: 'lead-1', createdAt: 1, name: 'Pat Doe', phoneE164: '+15165550100',
    email: 'pat@example.com', zip: '11743', service: 'roof-repair',
  });
});

describe('audited PII reads', () => {
  it('writes an access-log row on a lead-PII read', async () => {
    const lead = await viewLead(repos, op, 'lead-1', deps());
    expect(lead?.name).toBe('Pat Doe');
    const rows = accessRows();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ operator_id: 'op-adam', action: 'view_lead', lead_id: 'lead-1', ip: '203.0.113.7' });
  });

  it('logs nothing and returns undefined when the lead does not exist (no PII exposed)', async () => {
    const lead = await viewLead(repos, op, 'missing', deps());
    expect(lead).toBeUndefined();
    expect(accessRows()).toHaveLength(0);
  });

  it('failed-send queue logs one access row per lead returned', async () => {
    await repos.lead.insert({ id: 'lead-2', createdAt: 2, name: 'Sam Roe', phoneE164: '+15165550111', zip: '11787', service: 'roof-replacement', status: 'failed_followup' });
    await repos.lead.insert({ id: 'lead-3', createdAt: 3, name: 'Lee Poe', phoneE164: '+15165550122', zip: '11704', service: 'roof-leak-repair', status: 'failed_followup' });
    const failed = await listFailedSends(repos, op, deps());
    expect(failed.map((l) => l.id).sort()).toEqual(['lead-2', 'lead-3']);
    const rows = accessRows();
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.action === 'view_failed_send')).toBe(true);
    expect(rows.map((r) => r.lead_id).sort()).toEqual(['lead-2', 'lead-3']);
  });
});

describe('resend token — mint & verify (side-effect free)', () => {
  it('round-trips a valid token', async () => {
    const { token, claims } = await mintResendToken({ leadId: 'lead-1', messageLogId: 'msg-1' }, { secret: SECRET, now: 1_000_000, newId: () => 'jti-1' });
    expect(claims.exp).toBe(1_000_000 + DEFAULT_RESEND_TTL_MS);
    const v = await verifyResendToken(token, SECRET, 1_000_100);
    expect(v.ok).toBe(true);
    if (v.ok) expect(v.claims).toEqual({ jti: 'jti-1', leadId: 'lead-1', messageLogId: 'msg-1', exp: claims.exp });
  });

  it('rejects a tampered payload as bad_signature', async () => {
    const { token } = await mintResendToken({ leadId: 'lead-1', messageLogId: 'msg-1' }, { secret: SECRET, now: 1_000_000, newId: () => 'jti-1' });
    const [payload, sig] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ jti: 'jti-x', leadId: 'lead-1', messageLogId: 'msg-1', exp: 1_000_000 + DEFAULT_RESEND_TTL_MS })).toString('base64url');
    const v = await verifyResendToken(`${forged}.${sig}`, SECRET, 1_000_100);
    expect(v).toEqual({ ok: false, reason: 'bad_signature' });
    expect(payload).not.toBe(forged);
  });

  it('rejects a token signed with a different secret', async () => {
    const { token } = await mintResendToken({ leadId: 'lead-1', messageLogId: 'msg-1' }, { secret: 'other-secret', now: 1_000_000, newId: () => 'jti-1' });
    const v = await verifyResendToken(token, SECRET, 1_000_100);
    expect(v).toEqual({ ok: false, reason: 'bad_signature' });
  });

  it('rejects an expired token', async () => {
    const { token, claims } = await mintResendToken({ leadId: 'lead-1', messageLogId: 'msg-1' }, { secret: SECRET, now: 1_000_000, newId: () => 'jti-1', ttlMs: 60_000 });
    const v = await verifyResendToken(token, SECRET, claims.exp);
    expect(v).toEqual({ ok: false, reason: 'expired' });
  });

  it('rejects malformed input', async () => {
    expect(await verifyResendToken('no-dot', SECRET, 1)).toEqual({ ok: false, reason: 'malformed' });
    expect(await verifyResendToken('', SECRET, 1)).toEqual({ ok: false, reason: 'malformed' });
    expect(await verifyResendToken(undefined, SECRET, 1)).toEqual({ ok: false, reason: 'malformed' });
    expect(await verifyResendToken('!!!.@@@', SECRET, 1)).toEqual({ ok: false, reason: 'malformed' });
  });

  it('verify does NOT consume the token (safe for the GET confirm page)', async () => {
    const { token } = await mintResendToken({ leadId: 'lead-1', messageLogId: 'msg-1' }, { secret: SECRET, now: 1_000_000, newId: () => 'jti-1' });
    await verifyResendToken(token, SECRET, 1_000_100);
    await verifyResendToken(token, SECRET, 1_000_100);
    const count = db.prepare('SELECT COUNT(*) AS n FROM resend_token').get() as { n: number };
    expect(count.n).toBe(0); // no GET side effect
  });
});

describe('resend authorization — single use (POST only)', () => {
  it('authorizes once, then rejects a replay', async () => {
    const { token } = await mintResendToken({ leadId: 'lead-1', messageLogId: 'msg-1' }, { secret: SECRET, now: 1_000_000, newId: () => 'jti-1' });
    const first = await authorizeResend(token, repos, { secret: SECRET, now: 1_000_100 });
    expect(first.status).toBe('ok');
    const replay = await authorizeResend(token, repos, { secret: SECRET, now: 1_000_200 });
    expect(replay.status).toBe('replayed');
    const count = db.prepare('SELECT COUNT(*) AS n FROM resend_token').get() as { n: number };
    expect(count.n).toBe(1);
  });

  it('does not consume an invalid token', async () => {
    const bad = await authorizeResend('garbage', repos, { secret: SECRET, now: 1_000_100 });
    expect(bad).toEqual({ status: 'invalid', reason: 'malformed' });
    const count = db.prepare('SELECT COUNT(*) AS n FROM resend_token').get() as { n: number };
    expect(count.n).toBe(0);
  });

  it('does not consume an expired token', async () => {
    const { token, claims } = await mintResendToken({ leadId: 'lead-1', messageLogId: 'msg-1' }, { secret: SECRET, now: 1_000_000, newId: () => 'jti-1', ttlMs: 60_000 });
    const r = await authorizeResend(token, repos, { secret: SECRET, now: claims.exp + 1 });
    expect(r).toEqual({ status: 'invalid', reason: 'expired' });
    const count = db.prepare('SELECT COUNT(*) AS n FROM resend_token').get() as { n: number };
    expect(count.n).toBe(0);
  });
});
