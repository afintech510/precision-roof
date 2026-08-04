import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SqlExecutor, SqlParam } from '../db/executor';
import { createRepositories } from '../db/repositories';
import type { SendSms } from './twilio-send';
import type { SendEmail } from './email-send';
import { runReviewRequestSweep, type ReviewRequestSweepDeps } from './review-request-sweep';

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

let repos: ReturnType<typeof createRepositories>;
let smsSent: string[];
let emailsSent: string[];
let smsShouldFail: boolean;
let emailShouldFail: boolean;

function deps(overrides: Partial<ReviewRequestSweepDeps> = {}): ReviewRequestSweepDeps {
  const sendSms: SendSms = async (to) => {
    if (smsShouldFail) return { ok: false, message: 'boom' };
    smsSent.push(to);
    return { ok: true, messageSid: 'SM_TEST' };
  };
  const sendEmail: SendEmail = async (msg) => {
    if (emailShouldFail) return { ok: false, message: 'boom' };
    emailsSent.push(msg.to);
    return { ok: true, messageId: 'MSG_TEST' };
  };
  return {
    now: 1000,
    sendSms,
    sendEmail,
    reviewUrl: 'https://g.page/r/test/review',
    unsubscribeBaseUrl: 'https://premiumroofsolutions.com',
    unsubscribeSecret: 'test-secret',
    ...overrides,
  };
}

beforeEach(() => {
  const db = new DatabaseSync(':memory:');
  db.exec(UP);
  repos = createRepositories(nodeExecutor(db));
  smsSent = [];
  emailsSent = [];
  smsShouldFail = false;
  emailShouldFail = false;
});

describe('runReviewRequestSweep', () => {
  it('sends the identical ask to every pending row regardless of channel', async () => {
    await repos.reviewRequest.createPending({ id: 'r1', jobId: 'job1', customerContact: '+15165550100', channel: 'sms', requestedAt: 1 });
    await repos.reviewRequest.createPending({ id: 'r2', jobId: 'job1', customerContact: 'pat@example.com', channel: 'email', requestedAt: 2 });

    const result = await runReviewRequestSweep(repos, deps());

    expect(result).toEqual({ swept: 2, sent: 2, suppressed: 0, failed: 0 });
    expect(smsSent).toEqual(['+15165550100']);
    expect(emailsSent).toEqual(['pat@example.com']);
  });

  it('honors suppression on both channels — suppressed contacts get nothing', async () => {
    await repos.suppression.suppress('sms', '+15165550100', 0, 'STOP');
    await repos.reviewRequest.createPending({ id: 'r1', jobId: 'job1', customerContact: '+15165550100', channel: 'sms', requestedAt: 1 });
    await repos.reviewRequest.createPending({ id: 'r2', jobId: 'job1', customerContact: 'pat@example.com', channel: 'email', requestedAt: 2 });

    const result = await runReviewRequestSweep(repos, deps());

    expect(result).toEqual({ swept: 2, sent: 1, suppressed: 1, failed: 0 });
    expect(smsSent).toEqual([]);
    expect(emailsSent).toEqual(['pat@example.com']);

    const rows = await repos.reviewRequest.listPending(10);
    expect(rows).toEqual([]); // both resolved — one sent, one suppressed
  });

  it('marks a send failure as failed, not stuck pending forever', async () => {
    smsShouldFail = true;
    await repos.reviewRequest.createPending({ id: 'r1', jobId: 'job1', customerContact: '+15165550100', channel: 'sms', requestedAt: 1 });

    const result = await runReviewRequestSweep(repos, deps());

    expect(result).toEqual({ swept: 1, sent: 0, suppressed: 0, failed: 1 });
  });

  it('is exactly-once: a row already sent is never resent on a later sweep', async () => {
    await repos.reviewRequest.createPending({ id: 'r1', jobId: 'job1', customerContact: '+15165550100', channel: 'sms', requestedAt: 1 });
    await runReviewRequestSweep(repos, deps());
    smsSent = [];
    const second = await runReviewRequestSweep(repos, deps());

    expect(second).toEqual({ swept: 0, sent: 0, suppressed: 0, failed: 0 });
    expect(smsSent).toEqual([]);
  });

  it('has no satisfaction gating — ungated by construction (only inputs are contact + channel)', async () => {
    await repos.reviewRequest.createPending({ id: 'r1', jobId: 'job1', customerContact: '+15165550100', channel: 'sms', requestedAt: 1 });
    const result = await runReviewRequestSweep(repos, deps());
    expect(result.sent).toBe(1); // fires regardless of any job satisfaction field — none is even read here
  });
});
