import { describe, it, expect, beforeAll } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Phase 02 — validates the D1 operational-store schema (spec §2.5) in-process
// against SQLite, without a network round-trip to D1. node:sqlite is the same
// engine D1 runs, so type/constraint behaviour matches.

const ROOT = process.cwd();
const UP = readFileSync(join(ROOT, 'migrations', '0001_init_operational_store.sql'), 'utf8');
const DOWN = readFileSync(join(ROOT, 'migrations', 'rollback', '0001_down.sql'), 'utf8');

const EXPECTED_TABLES = [
  'lead', 'consent_record', 'booking', 'suppression',
  'message_log', 'webhook_events', 'operator_access_log', 'review_request',
];

function freshDb(): InstanceType<typeof DatabaseSync> {
  const db = new DatabaseSync(':memory:');
  db.exec(UP);
  return db;
}

describe('operational store — SQLite-native type audit (prior CRITICAL)', () => {
  it('uses no Postgres-only types anywhere in the DDL', () => {
    // Audit the DDL only — comments legitimately name the forbidden types.
    const ddl = UP.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const forbidden = /\b(timestamptz|uuid|serial|bigserial|jsonb|boolean)\b/i;
    const match = ddl.match(forbidden);
    expect(match, `forbidden type token found: ${match?.[0]}`).toBeNull();
  });

  it('declares every timestamp column as INTEGER (epoch-ms)', () => {
    const db = freshDb();
    for (const table of EXPECTED_TABLES) {
      const cols = db
        .prepare(`SELECT name, type FROM pragma_table_info(?)`)
        .all(table) as Array<{ name: string; type: string }>;
      for (const c of cols) {
        if (/(_at|_timestamp)$/.test(c.name)) {
          expect(c.type, `${table}.${c.name} must be INTEGER`).toBe('INTEGER');
        }
      }
    }
    db.close();
  });

  it('declares ids as TEXT', () => {
    const db = freshDb();
    const idType = (t: string) =>
      (db.prepare(`SELECT type FROM pragma_table_info(?) WHERE name = 'id'`).get(t) as
        | { type: string }
        | undefined)?.type;
    for (const t of ['lead', 'consent_record', 'booking', 'message_log', 'operator_access_log', 'review_request']) {
      expect(idType(t), `${t}.id`).toBe('TEXT');
    }
    db.close();
  });
});

describe('operational store — structure', () => {
  let db: InstanceType<typeof DatabaseSync>;
  beforeAll(() => { db = freshDb(); });

  it('creates all eight tables', () => {
    const names = (db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all() as Array<{ name: string }>)
      .map((r) => r.name);
    for (const t of EXPECTED_TABLES) expect(names).toContain(t);
  });

  it('has the partial speed-to-lead index', () => {
    const idx = db
      .prepare(`SELECT sql FROM sqlite_master WHERE type='index' AND name='idx_lead_pending_speed_to_lead'`)
      .get() as { sql: string } | undefined;
    expect(idx?.sql).toMatch(/WHERE\s+speed_to_lead_sms_sent_at\s+IS\s+NULL/i);
  });

  it('has the review_request(status, requested_at) index', () => {
    const idx = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='index' AND name='idx_review_request_status_requested'`)
      .get();
    expect(idx).toBeTruthy();
  });

  it('keys suppression on (channel, contact)', () => {
    const pk = (db.prepare(`SELECT name FROM pragma_table_info('suppression') WHERE pk > 0 ORDER BY pk`).all() as Array<{ name: string }>)
      .map((r) => r.name);
    expect(pk).toEqual(['channel', 'contact']);
  });
});

describe('operational store — constraints & invariants', () => {
  it('rejects an invalid lead.status via CHECK', () => {
    const db = freshDb();
    expect(() =>
      db.exec(
        `INSERT INTO lead (id, created_at, updated_at, name, phone_e164, zip, service, status)
         VALUES ('l1', 1, 1, 'A', '+15165550100', '11743', 'roof_repair', 'not_a_status')`,
      ),
    ).toThrow();
    db.close();
  });

  it('enforces UNIQUE(provider_message_id) on message_log', () => {
    const db = freshDb();
    const ins = (id: string) =>
      db.exec(
        `INSERT INTO message_log (id, channel, provider_message_id, status, created_at, updated_at)
         VALUES ('${id}', 'sms', 'SM123', 'sent', 1, 1)`,
      );
    ins('m1');
    expect(() => ins('m2')).toThrow();
    db.close();
  });

  it('enforces the suppression composite primary key', () => {
    const db = freshDb();
    const ins = () => db.exec(`INSERT INTO suppression (channel, contact, suppressed_at) VALUES ('sms', '+15165550100', 1)`);
    ins();
    expect(ins).toThrow();
    db.close();
  });

  it('makes consent_record append-only (UPDATE blocked, INSERT allowed)', () => {
    const db = freshDb();
    db.exec(
      `INSERT INTO consent_record (id, phone_e164, consent_text, consent_version, consent_timestamp)
       VALUES ('c1', '+15165550100', 'I agree', 'v1', 1)`,
    );
    expect(() => db.exec(`UPDATE consent_record SET consent_ip = 'x' WHERE id = 'c1'`)).toThrow(/append-only/);
    db.close();
  });
});

describe('operational store — rollback', () => {
  it('down migration drops every table cleanly', () => {
    const db = freshDb();
    db.exec(DOWN);
    const names = (db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all() as Array<{ name: string }>)
      .map((r) => r.name);
    for (const t of EXPECTED_TABLES) expect(names).not.toContain(t);
    db.close();
  });
});
