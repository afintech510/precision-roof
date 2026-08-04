import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { D1Database } from '@cloudflare/workers-types';
import type { SqlParam } from '../db/executor';
import { GET as getLead, POST as postLead } from '../pages/api/operator/leads/[id]';
import { GET as getFailedSends } from '../pages/api/operator/failed-sends';
import { GET as getConfirm } from '../pages/api/operator/resend/confirm';
import { POST as postResend } from '../pages/api/operator/resend/index';
import { mintResendToken } from './dashboard';
import type { ReserveOutcome } from './sms-authority';
import type { SmsDispatchMessage } from './sms-dispatch';
import { SPEED_TO_LEAD_BODY } from './slo-sweep';
import { __setEnv } from '../test/cf-workers-stub';

// Route-level tests for /api/operator/*: Cloudflare Access gate (Cf-Access-
// Authenticated-User-Email header), audited PII reads, and the single-use
// resend-token confirm/authorize pair — all over a fake D1 backed by
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

function fakeSmsAuthority(reserveResult: ReserveOutcome) {
  return {
    idFromName: (name: string) => name,
    get: () => ({
      reserve: async (): Promise<ReserveOutcome> => reserveResult,
      claimSend: async () => ({ allow: true as const }),
    }),
  };
}

function fakeSmsQueue(sink: SmsDispatchMessage[]) {
  return { send: async (msg: SmsDispatchMessage) => { sink.push(msg); } };
}

const RESEND_SECRET = 'test-resend-secret';
const ACCESS_HEADER = 'Cf-Access-Authenticated-User-Email';
const OPERATOR_EMAIL = 'adam@premiumroofsolutions.com';

let db: InstanceType<typeof DatabaseSync>;
let env: { OP_STORE: D1Database; RESEND_TOKEN_SECRET?: string };

beforeEach(async () => {
  db = new DatabaseSync(':memory:');
  for (const m of MIGRATIONS) db.exec(m);
  env = { OP_STORE: fakeD1(db), RESEND_TOKEN_SECRET: RESEND_SECRET };

  db.exec(
    `INSERT INTO lead (id, created_at, updated_at, name, phone_e164, email, zip, service, status, advertising_status)
     VALUES ('lead-1', 1, 1, 'Pat Doe', '+15165550100', 'pat@example.com', '11743', 'roof-repair', 'new', 'active')`,
  );
  db.exec(
    `INSERT INTO lead (id, created_at, updated_at, name, phone_e164, zip, service, status, advertising_status)
     VALUES ('lead-2', 2, 2, 'Sam Roe', '+15165550111', '11787', 'roof-replacement', 'failed_followup', 'active')`,
  );
});

function req(url: string, opts: { method?: string; withAccess?: boolean; body?: unknown; env?: unknown } = {}) {
  __setEnv(('env' in opts ? opts.env : env) as Record<string, unknown>);
  const headers: Record<string, string> = {};
  if (opts.withAccess ?? true) headers[ACCESS_HEADER] = OPERATOR_EMAIL;
  if (opts.body !== undefined) headers['content-type'] = 'application/json';
  const request = new Request(url, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  return { request } as Record<string, unknown>;
}

describe('GET /api/operator/leads/:id', () => {
  it('403s without the Access identity header', async () => {
    const res = await getLead({ ...req('https://x/api/operator/leads/lead-1', { withAccess: false }), params: { id: 'lead-1' }, clientAddress: '203.0.113.1' } as never);
    expect(res.status).toBe(403);
  });

  it('503s when not configured', async () => {
    const res = await getLead({ ...req('https://x/api/operator/leads/lead-1', { env: {} }), params: { id: 'lead-1' }, clientAddress: '203.0.113.1' } as never);
    expect(res.status).toBe(503);
  });

  it('returns the lead and writes an access-log row', async () => {
    const res = await getLead({ ...req('https://x/api/operator/leads/lead-1'), params: { id: 'lead-1' }, clientAddress: '203.0.113.1' } as never);
    const out = (await res.json()) as { lead: { id: string; name: string } };
    expect(res.status).toBe(200);
    expect(out.lead.name).toBe('Pat Doe');
    const rows = db.prepare('SELECT operator_id, action, lead_id FROM operator_access_log').all() as Array<{ operator_id: string; action: string; lead_id: string }>;
    expect(rows).toEqual([{ operator_id: OPERATOR_EMAIL, action: 'view_lead', lead_id: 'lead-1' }]);
  });

  it('404s and logs nothing for a missing lead', async () => {
    const res = await getLead({ ...req('https://x/api/operator/leads/missing'), params: { id: 'missing' }, clientAddress: '203.0.113.1' } as never);
    expect(res.status).toBe(404);
    const rows = db.prepare('SELECT COUNT(*) AS n FROM operator_access_log').all();
    expect((rows[0] as { n: number }).n).toBe(0);
  });

  it('rejects POST', async () => {
    const res = await postLead({} as never);
    expect(res.status).toBe(405);
  });
});

describe('GET /api/operator/failed-sends', () => {
  it('403s without the Access identity header', async () => {
    const res = await getFailedSends({ ...req('https://x/api/operator/failed-sends', { withAccess: false }), clientAddress: '203.0.113.1' } as never);
    expect(res.status).toBe(403);
  });

  it('returns the failed-followup leads with one access-log row each', async () => {
    const res = await getFailedSends({ ...req('https://x/api/operator/failed-sends'), clientAddress: '203.0.113.1' } as never);
    const out = (await res.json()) as { leads: Array<{ id: string }> };
    expect(res.status).toBe(200);
    expect(out.leads.map((l) => l.id)).toEqual(['lead-2']);
    const rows = db.prepare('SELECT COUNT(*) AS n FROM operator_access_log').all();
    expect((rows[0] as { n: number }).n).toBe(1);
  });
});

describe('GET /api/operator/resend/confirm', () => {
  it('403s without the Access identity header', async () => {
    const res = await getConfirm({ ...req('https://x/api/operator/resend/confirm?token=x', { withAccess: false }), url: new URL('https://x/api/operator/resend/confirm?token=x') } as never);
    expect(res.status).toBe(403);
  });

  it('verifies a valid token without consuming it', async () => {
    const { token } = await mintResendToken({ leadId: 'lead-1', messageLogId: 'msg-1' }, { secret: RESEND_SECRET, now: Date.now(), newId: () => 'jti-1' });
    const url = new URL(`https://x/api/operator/resend/confirm?token=${encodeURIComponent(token)}`);
    const res = await getConfirm({ ...req(url.toString()), url } as never);
    const out = (await res.json()) as { ok: boolean };
    expect(res.status).toBe(200);
    expect(out.ok).toBe(true);
    const count = db.prepare('SELECT COUNT(*) AS n FROM resend_token').all();
    expect((count[0] as { n: number }).n).toBe(0); // GET never consumes
  });

  it('400s on an expired token', async () => {
    const { token } = await mintResendToken({ leadId: 'lead-1', messageLogId: 'msg-1' }, { secret: RESEND_SECRET, now: Date.now() - 1_000_000, newId: () => 'jti-2', ttlMs: 1 });
    const url = new URL(`https://x/api/operator/resend/confirm?token=${encodeURIComponent(token)}`);
    const res = await getConfirm({ ...req(url.toString()), url } as never);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/operator/resend', () => {
  it('403s without the Access identity header', async () => {
    const res = await postResend(req('https://x/api/operator/resend', { method: 'POST', withAccess: false, body: { token: 'x' } }) as never);
    expect(res.status).toBe(403);
  });

  it('authorizes a valid token once and reports the blocked dispatch', async () => {
    const { token } = await mintResendToken({ leadId: 'lead-1', messageLogId: 'msg-1' }, { secret: RESEND_SECRET, now: Date.now(), newId: () => 'jti-3' });
    const res = await postResend(req('https://x/api/operator/resend', { method: 'POST', body: { token } }) as never);
    const out = (await res.json()) as { status: string; dispatched: boolean };
    expect(res.status).toBe(202);
    expect(out.status).toBe('ok');
    expect(out.dispatched).toBe(false);
  });

  it('dispatches through the DO+Queue path and enqueues the speed-to-lead body when the bindings are live', async () => {
    const sent: SmsDispatchMessage[] = [];
    const withSms = { ...env, SMS_AUTHORITY: fakeSmsAuthority({ allow: true, token: 'tok-resend-1' }), SMS_QUEUE: fakeSmsQueue(sent) };
    const { token } = await mintResendToken({ leadId: 'lead-1', messageLogId: 'msg-1' }, { secret: RESEND_SECRET, now: Date.now(), newId: () => 'jti-5' });
    const res = await postResend(req('https://x/api/operator/resend', { method: 'POST', body: { token }, env: withSms }) as never);
    const out = (await res.json()) as { status: string; dispatched: boolean };
    expect(res.status).toBe(202);
    expect(out.dispatched).toBe(true);
    expect(sent).toEqual([{ leadId: 'lead-1', phoneE164: '+15165550100', body: SPEED_TO_LEAD_BODY, allowToken: 'tok-resend-1' }]);
  });

  it('reports the blocked dispatch when the DO reservation is denied', async () => {
    const withSms = { ...env, SMS_AUTHORITY: fakeSmsAuthority({ allow: false, reason: 'suppressed' }), SMS_QUEUE: fakeSmsQueue([]) };
    const { token } = await mintResendToken({ leadId: 'lead-1', messageLogId: 'msg-1' }, { secret: RESEND_SECRET, now: Date.now(), newId: () => 'jti-6' });
    const res = await postResend(req('https://x/api/operator/resend', { method: 'POST', body: { token }, env: withSms }) as never);
    const out = (await res.json()) as { status: string; dispatched: boolean };
    expect(res.status).toBe(202);
    expect(out.dispatched).toBe(false);
  });

  it('rejects a replayed token with 409', async () => {
    const { token } = await mintResendToken({ leadId: 'lead-1', messageLogId: 'msg-1' }, { secret: RESEND_SECRET, now: Date.now(), newId: () => 'jti-4' });
    await postResend(req('https://x/api/operator/resend', { method: 'POST', body: { token } }) as never);
    const res = await postResend(req('https://x/api/operator/resend', { method: 'POST', body: { token } }) as never);
    const out = (await res.json()) as { status: string };
    expect(res.status).toBe(409);
    expect(out.status).toBe('replayed');
  });

  it('401s on an invalid token', async () => {
    const res = await postResend(req('https://x/api/operator/resend', { method: 'POST', body: { token: 'garbage' } }) as never);
    expect(res.status).toBe(401);
  });
});
