import type { D1Database } from '@cloudflare/workers-types';

// A tiny SQL execution seam so repositories are storage-agnostic: production
// runs on Cloudflare D1; tests run on node:sqlite (same SQLite engine). Only
// positional (?) parameters are used, so both bind identically.

export type SqlParam = string | number | null;

export interface RunResult {
  /** Rows affected — used by repositories to detect atomic claim/idempotency outcomes. */
  changes: number;
}

export interface SqlExecutor {
  run(sql: string, params?: SqlParam[]): Promise<RunResult>;
  get<T>(sql: string, params?: SqlParam[]): Promise<T | undefined>;
  all<T>(sql: string, params?: SqlParam[]): Promise<T[]>;
}

/** Production adapter over a Cloudflare D1 binding (spec §2.5). */
export function d1Executor(db: D1Database): SqlExecutor {
  const prep = (sql: string, params: SqlParam[]) =>
    params.length ? db.prepare(sql).bind(...params) : db.prepare(sql);
  return {
    async run(sql, params = []) {
      const r = await prep(sql, params).run();
      return { changes: r.meta.changes ?? 0 };
    },
    async get<T>(sql: string, params: SqlParam[] = []) {
      const row = await prep(sql, params).first<T>();
      return row ?? undefined;
    },
    async all<T>(sql: string, params: SqlParam[] = []) {
      const r = await prep(sql, params).all<T>();
      return r.results;
    },
  };
}
