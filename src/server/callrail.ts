import type { createRepositories } from '../db/repositories';
import type { ReserveDenyReason, ReserveOutcome } from './sms-authority';
import type { SmsDispatchMessage } from './sms-dispatch';

// CallRail missed-call text-back core (spec §3.2 "CallRail voice path", §5.3,
// F-010, BUILDPLAN Phase 05c Task 2). Pure logic over the repos + the injected
// DO reservation/enqueue calls, so it unit-tests without a Worker runtime.
// The API route is a thin adapter: verify the CallRail signature, parse the
// post-call webhook JSON, call this core.
//
// [C2-010] HIGH finding, resolved here: original-caller-ID (ANI) passthrough
// from CallRail to Twilio is a Phase-0 verification gate that can't be
// exercised without a live CallRail account/keys (none in this environment).
// Per spec's own documented fallback, this core drives the text-back
// entirely from CallRail's OWN post-call webhook payload — never assumes
// Twilio received the caller's true ANI on an inbound leg. Ownership is
// therefore CallRail-webhook-driven for the missed-call trigger; whichever
// platform's number the caller reaches is irrelevant here because we only
// react to CallRail's completed-call event, not a Twilio inbound leg.
//
// Reuses the 05b send path exactly (reserveSms + enqueueSms bound to the same
// SMS_AUTHORITY DO / SMS_QUEUE as /api/lead) — no second SMS pipeline. A
// missed call gets a minimal `lead` row (source=missed_call_callback) so the
// per-phone window, suppression check, and budget reservation are identical
// to a form-submitted lead.

type Repos = ReturnType<typeof createRepositories>;

export const MISSED_CALL_TEXT_BACK_BODY =
  "Sorry we missed your call! This is Premium Roofing Solutions — reply here or call us back and we'll help right away. Reply STOP to opt out.";

const NANP_E164 = /^\+1[2-9]\d{2}[2-9]\d{6}$/;
function normalizePhone(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return NANP_E164.test(trimmed) ? trimmed : null;
}

export interface CallrailCallWebhook {
  id: string | number;
  answered?: boolean;
  direction?: string;
  customer_phone_number?: string | null;
  tracking_phone_number?: string | null;
}

export interface CallrailDeps {
  now: number;
  newId: () => string;
  /** Bound to the SMS_AUTHORITY Durable Object; called at most once, same as /api/lead. */
  reserveSms: (phoneE164: string, leadId: string) => Promise<ReserveOutcome>;
  /** Bound to the SMS_QUEUE producer; only called when the DO allows. */
  enqueueSms: (msg: SmsDispatchMessage) => Promise<void>;
}

export type CallrailMissedCallResult =
  | { processed: false } // duplicate delivery, skipped
  | { processed: true; textedBack: false; reason: 'not_missed' | 'malformed_phone' | ReserveDenyReason }
  | { processed: true; textedBack: true; leadId: string };

export async function handleCallrailMissedCall(
  hook: CallrailCallWebhook,
  repos: Repos,
  deps: CallrailDeps,
): Promise<CallrailMissedCallResult> {
  // 1) Idempotency — CallRail retries a delivery on a non-2xx response.
  const key = String(hook.id);
  const fresh = await repos.webhookEvents.claim(key, 'callrail', deps.now, 'missed_call');
  if (!fresh) return { processed: false };

  // 2) Only an unanswered INBOUND call is a "missed call" worth a text-back —
  //    outbound calls and answered calls never reach the send path.
  if (hook.direction !== 'inbound' || hook.answered !== false) {
    await repos.webhookEvents.markProcessed(key, deps.now);
    return { processed: true, textedBack: false, reason: 'not_missed' };
  }

  const phone = normalizePhone(hook.customer_phone_number);
  if (phone === null) {
    await repos.webhookEvents.markProcessed(key, deps.now);
    return { processed: true, textedBack: false, reason: 'malformed_phone' };
  }

  // 3) Minimal lead so the DO reservation, suppression check, and per-phone
  //    cap apply exactly as they would for a form submission — never a
  //    second, unaccounted SMS pipeline (spec §3.2 CAUTION).
  const leadId = deps.newId();
  await repos.lead.insert({
    id: leadId,
    createdAt: deps.now,
    name: 'Missed call',
    phoneE164: phone,
    email: null,
    zip: '',
    service: 'missed_call_callback',
    advertisingStatus: 'active',
    gaClientId: null,
  });

  const reservation = await deps.reserveSms(phone, leadId);
  if (!reservation.allow) {
    await repos.webhookEvents.markProcessed(key, deps.now);
    return { processed: true, textedBack: false, reason: reservation.reason };
  }

  await repos.lead.setChannel(leadId, 'sms', deps.now);
  await deps.enqueueSms({
    leadId,
    phoneE164: phone,
    body: MISSED_CALL_TEXT_BACK_BODY,
    allowToken: reservation.token,
  });
  await repos.webhookEvents.markProcessed(key, deps.now);
  return { processed: true, textedBack: true, leadId };
}
