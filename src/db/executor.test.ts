import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import type { D1Database } from '@cloudflare/workers-types';
import { d1Executor, type SqlParam } from './executor';

// Direct unit test for the production D1 adapter itself (route tests only ever
// exercise their own local reimplementation of this shape, always with
// `meta.changes` populated — this covers the adapter's own `?? 0` fallback for
// when a real D1 `run()` result omits `changes`, e.g. non-mutating statements).

function fakeD1(db: InstanceType<typeof DatabaseSync>, opts: { omitChanges?: boolean } = {}): D1Database {
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
          return { meta: opts.omitChanges ? {} : { changes: Number(r.changes) } };
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

let db: InstanceType<typeof DatabaseSync>;

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  db.exec('CREATE TABLE widget (id TEXT PRIMARY KEY, label TEXT)');
});

describe('d1Executor.run', () => {
  it('reports rows affected via meta.changes', async () => {
    const exec = d1Executor(fakeD1(db));
    const result = await exec.run('INSERT INTO widget (id, label) VALUES (?, ?)', ['w1', 'Widget One']);
    expect(result.changes).toBe(1);
  });

  it('runs with no params when none are given', async () => {
    db.exec("INSERT INTO widget (id, label) VALUES ('w1', 'seed')");
    const exec = d1Executor(fakeD1(db));
    const result = await exec.run('DELETE FROM widget');
    expect(result.changes).toBe(1);
  });

  it('falls back to 0 when meta.changes is absent', async () => {
    const exec = d1Executor(fakeD1(db, { omitChanges: true }));
    const result = await exec.run('INSERT INTO widget (id, label) VALUES (?, ?)', ['w1', 'Widget One']);
    expect(result.changes).toBe(0);
  });
});

describe('d1Executor.get', () => {
  it('returns the row when one matches', async () => {
    db.exec("INSERT INTO widget (id, label) VALUES ('w1', 'Widget One')");
    const exec = d1Executor(fakeD1(db));
    const row = await exec.get<{ id: string; label: string }>('SELECT * FROM widget WHERE id = ?', ['w1']);
    expect(row).toEqual({ id: 'w1', label: 'Widget One' });
  });

  it('returns undefined when no row matches', async () => {
    const exec = d1Executor(fakeD1(db));
    const row = await exec.get('SELECT * FROM widget WHERE id = ?', ['nope']);
    expect(row).toBeUndefined();
  });

  it('defaults params to an empty array when omitted', async () => {
    db.exec("INSERT INTO widget (id, label) VALUES ('w1', 'Widget One')");
    const exec = d1Executor(fakeD1(db));
    const row = await exec.get<{ id: string }>('SELECT * FROM widget LIMIT 1');
    expect(row?.id).toBe('w1');
  });
});

describe('d1Executor.all', () => {
  it('returns every matching row', async () => {
    db.exec("INSERT INTO widget (id, label) VALUES ('w1', 'One'), ('w2', 'Two')");
    const exec = d1Executor(fakeD1(db));
    const rows = await exec.all<{ id: string }>('SELECT * FROM widget ORDER BY id');
    expect(rows.map((r) => r.id)).toEqual(['w1', 'w2']);
  });

  it('returns an empty array when nothing matches', async () => {
    const exec = d1Executor(fakeD1(db));
    const rows = await exec.all('SELECT * FROM widget');
    expect(rows).toEqual([]);
  });
});
