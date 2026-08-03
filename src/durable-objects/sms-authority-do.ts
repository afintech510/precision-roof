import { DurableObject } from 'cloudflare:workers';
import type { SqlExecutor, SqlParam } from '../db/executor';
import { d1Executor } from '../db/executor';
import { suppressionRepo } from '../db/repositories';
import {
  SMS_AUTHORITY_SCHEMA,
  reserveSmsSend,
  claimSmsSend,
  setBudgetOverride,
  type ReserveOutcome,
  type ClaimOutcome,
} from '../server/sms-authority';

// Durable Object wrapper for the SMS-send concurrency authority (spec §1.2,
// §3.1). Thin by design — all the decision logic lives in the pure, unit-
// tested `sms-authority.ts` core; this class only adapts the DO's own SQLite
// storage to the shared `SqlExecutor` seam and wires the suppression check to
// D1 via the `OP_STORE` binding. A DO instance serializes every call to
// itself, which is what makes reserve()/claimSend() the single concurrency
// authority the spec calls for.
//
// Deployed as a SINGLETON: every caller resolves the same instance via
// `env.SMS_AUTHORITY.idFromName('global')` so all phones share one
// serialization point (needed for the anomaly-budget baseline to mean
// anything, and for the per-phone window to actually dedupe across leads).

function sqlStorageExecutor(sql: SqlStorage): SqlExecutor {
  return {
    async run(query: string, params: SqlParam[] = []) {
      const cursor = sql.exec(query, ...params);
      cursor.toArray(); // drain so rowsWritten reflects the statement
      return { changes: cursor.rowsWritten };
    },
    async get<T>(query: string, params: SqlParam[] = []) {
      const rows = sql.exec<Record<string, SqlStorageValue>>(query, ...params).toArray();
      return rows[0] === undefined ? undefined : (rows[0] as unknown as T);
    },
    async all<T>(query: string, params: SqlParam[] = []) {
      return sql.exec<Record<string, SqlStorageValue>>(query, ...params).toArray() as unknown as T[];
    },
  };
}

export class SmsAuthorityDO extends DurableObject<Cloudflare.Env> {
  private storage: SqlExecutor;

  constructor(ctx: DurableObjectState, env: Cloudflare.Env) {
    super(ctx, env);
    this.storage = sqlStorageExecutor(ctx.storage.sql);
    ctx.blockConcurrencyWhile(async () => {
      ctx.storage.sql.exec(SMS_AUTHORITY_SCHEMA);
    });
  }

  private async isSuppressed(phoneE164: string): Promise<boolean> {
    if (!this.env.OP_STORE) return false; // never fail closed if D1 isn't wired yet
    const repo = suppressionRepo(d1Executor(this.env.OP_STORE));
    return repo.isSuppressed('sms', phoneE164);
  }

  async reserve(phoneE164: string, leadId: string): Promise<ReserveOutcome> {
    return reserveSmsSend(
      { phoneE164, leadId },
      this.storage,
      { now: Date.now(), newId: () => crypto.randomUUID(), isSuppressed: (p) => this.isSuppressed(p) },
    );
  }

  async claimSend(leadId: string, phoneE164: string): Promise<ClaimOutcome> {
    return claimSmsSend(
      { leadId, phoneE164 },
      this.storage,
      { now: Date.now(), newId: () => crypto.randomUUID(), isSuppressed: (p) => this.isSuppressed(p) },
    );
  }

  async setOverride(state: 'auto' | 'disabled' | 'forced_allow'): Promise<void> {
    await setBudgetOverride(this.storage, state);
  }
}
