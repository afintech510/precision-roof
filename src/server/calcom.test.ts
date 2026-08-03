import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SqlExecutor, SqlParam } from '../db/executor';
import { createRepositories } from '../db/repositories';
import { handleCalcomWebhook, type CalcomWebhook } from './calcom';

const UP = readFileSync(join(process.cwd(), 'migrations', '0001_init_operational_store.sql'), 'utf8');

function nodeExecutor(db: InstanceType<typeof DatabaseSync>): SqlExecutor {
  return {
    async run(sql: string, params: SqlParam[] = []) { return { changes: Number(db.prepare(sql).run(...params).changes) }; },
    async get<T>(sql: string, params: SqlParam[] = []) { const r = db.prepare(sql).get(...params); return r === undefined ? undefined : (r as T); },
    async all<T>(sql: string, params: SqlParam[] = []) { return db.prepare(sql).all(...params) as T[]; },
  };
}

let repos: ReturnType<typeof createRepositories>;
let ids: number;
const deps = () => ({ now: 1000, newId: () => `id-${++ids}` });

beforeEach(() => {
  const db = new DatabaseSync(':memory:');
  db.exec(UP);
  repos = createRepositories(nodeExecutor(db));
  ids = 0;
});

const walkUp: CalcomWebhook = {
  triggerEvent: 'BOOKING_CREATED',
  payload: { uid: 'CAL-1', startTime: '2026-09-01T15:00:00Z', attendees: [{ name: 'Pat D', email: 'pat@example.com' }] },
};

describe('Cal.com webhook handler', () => {
  it('creates a booking + minimal lead for a walk-up (never orphaned)', async () => {
    const r = await handleCalcomWebhook(walkUp, repos, deps());
    expect(r.processed).toBe(true);
    expect(r.source).toBe('booking_direct');
    const booking = await repos.booking.getByUid('CAL-1');
    expect(booking?.lead_id).toBe(r.leadId);
    expect(booking?.status).toBe('confirmed');
  });

  it('is idempotent — a redelivery does not double-process', async () => {
    await handleCalcomWebhook(walkUp, repos, deps());
    const dup = await handleCalcomWebhook(walkUp, repos, deps());
    expect(dup.processed).toBe(false);
  });

  it('links an existing lead instead of creating one', async () => {
    await repos.lead.insert({ id: 'lead-9', createdAt: 1, name: 'Existing', phoneE164: '+15165550100', zip: '11743', service: 'roof-repair' });
    const hook: CalcomWebhook = { ...walkUp, payload: { ...walkUp.payload, uid: 'CAL-2', metadata: { leadId: 'lead-9' } } };
    const r = await handleCalcomWebhook(hook, repos, deps());
    expect(r.source).toBe('form');
    expect(r.leadId).toBe('lead-9');
    const lead = await repos.lead.getById('lead-9');
    expect(lead?.status).toBe('booked');
  });

  it('passes through a real GA client_id', async () => {
    const hook: CalcomWebhook = { ...walkUp, payload: { ...walkUp.payload, uid: 'CAL-3', metadata: { ga_client_id: 'GA1.2.345' } } };
    const r = await handleCalcomWebhook(hook, repos, deps());
    expect(r.ga).toEqual({ event: 'booking_completed', clientId: 'GA1.2.345', unattributed: false });
  });

  it('marks the event unattributed rather than minting an id', async () => {
    const r = await handleCalcomWebhook(walkUp, repos, deps());
    expect(r.ga?.unattributed).toBe(true);
    expect(r.ga?.clientId).toBeNull();
  });

  it('processes a later cancellation as its own event', async () => {
    await handleCalcomWebhook(walkUp, repos, deps());
    const cancel: CalcomWebhook = { ...walkUp, triggerEvent: 'BOOKING_CANCELLED' };
    const r = await handleCalcomWebhook(cancel, repos, deps());
    expect(r.processed).toBe(true);
    const booking = await repos.booking.getByUid('CAL-1');
    expect(booking?.status).toBe('cancelled');
  });
});
