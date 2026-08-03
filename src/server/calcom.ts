import type { createRepositories } from '../db/repositories';

// Cal.com booking webhook core (spec §3.2, F-008). Pure logic over the repos so
// it unit-tests without a Worker runtime; the API route (added with the SSR/
// deploy wiring) is a thin adapter that supplies a D1-backed repos + verifies
// the signature. CRITICALs enforced here: webhook idempotency, walk-up bookings
// never orphaned, and GA attribution never minted.

type Repos = ReturnType<typeof createRepositories>;

export interface CalcomAttendee { name?: string; email?: string; phoneNumber?: string }
export interface CalcomBookingPayload {
  uid: string;
  startTime?: string;
  attendees?: CalcomAttendee[];
  metadata?: { leadId?: string; ga_client_id?: string };
}
export interface CalcomWebhook {
  triggerEvent: string; // e.g. BOOKING_CREATED / BOOKING_CANCELLED
  payload: CalcomBookingPayload;
}

export interface CalcomDeps {
  now: number;
  newId: () => string;
}

export interface CalcomResult {
  processed: boolean; // false = duplicate delivery, skipped
  bookingId?: string;
  leadId?: string;
  source?: 'form' | 'booking_direct';
  ga?: { event: 'booking_completed'; clientId: string | null; unattributed: boolean };
}

const statusFromTrigger = (trigger: string): string =>
  /cancel/i.test(trigger) ? 'cancelled' : 'confirmed';

export async function handleCalcomWebhook(
  hook: CalcomWebhook,
  repos: Repos,
  deps: CalcomDeps,
): Promise<CalcomResult> {
  const { uid, metadata } = hook.payload;

  // 1) Idempotency — key on uid + trigger so each transition processes once.
  const key = `${uid}:${hook.triggerEvent}`;
  const fresh = await repos.webhookEvents.claim(key, 'calcom', deps.now, hook.triggerEvent);
  if (!fresh) return { processed: false };

  // 2) Resolve the lead. Link an existing one; otherwise create a minimal
  //    walk-up lead so a direct booking is never orphaned.
  const attendee = hook.payload.attendees?.[0];
  let leadId = metadata?.leadId;
  let source: 'form' | 'booking_direct' = 'form';

  const existing = leadId ? await repos.lead.getById(leadId) : undefined;
  if (!existing) {
    leadId = deps.newId();
    source = 'booking_direct';
    await repos.lead.insert({
      id: leadId,
      createdAt: deps.now,
      name: attendee?.name ?? 'Cal.com booking',
      phoneE164: attendee?.phoneNumber ?? '',
      email: attendee?.email ?? null,
      zip: '',
      service: 'booking_direct',
      status: 'booked',
      gaClientId: metadata?.ga_client_id ?? null,
    });
  } else {
    await repos.lead.setStatus(existing.id, 'booked', deps.now);
  }

  // 3) Upsert the booking idempotently by Cal.com uid.
  const bookingId = deps.newId();
  await repos.booking.upsertByUid({
    id: bookingId,
    leadId,
    calcomBookingUid: uid,
    slotStart: hook.payload.startTime ? Date.parse(hook.payload.startTime) : deps.now,
    name: attendee?.name ?? null,
    phone: attendee?.phoneNumber ?? null,
    email: attendee?.email ?? null,
    status: statusFromTrigger(hook.triggerEvent),
    source,
    createdAt: deps.now,
  });

  // 4) GA booking_completed — real client_id or explicitly unattributed. Never
  //    mint a random id (it corrupts source/medium).
  const clientId = metadata?.ga_client_id ?? null;
  await repos.webhookEvents.markProcessed(key, deps.now);

  return {
    processed: true,
    bookingId,
    leadId,
    source,
    ga: { event: 'booking_completed', clientId, unattributed: clientId === null },
  };
}
