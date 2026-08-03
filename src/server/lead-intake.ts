import type { createRepositories } from '../db/repositories';
import { normalizeZip, resolveZipGate, SUFFOLK_ZIP_GATE, type ZipGateTable } from './east-end-gate';
import type { ReserveResult } from './lead-authority';

// Lead intake core (spec §3.1, §3.2, F-012, F-009). Pure decision logic over
// the repos + the East-End gate, so `/api/lead` (thin adapter) unit-tests with
// zero vendor keys. This is the ONE place that decides whether a freshly
// captured lead is eligible for the automated speed-to-lead SMS — everything
// else (the DO's per-phone/budget reservation, the actual send) is injected as
// `deps.dispatchSms` so this module never touches a binding directly.
//
// Two different "never fail closed" rules apply, deliberately in opposite
// directions:
//  - Lead CAPTURE always succeeds for well-formed input — a submission must
//    never be silently dropped just because a downstream dependency (DO,
//    Queue, Turnstile) isn't configured yet.
//  - The automated SMS SEND fails closed whenever we can't establish the
//    submission is human — an unverified Turnstile means anyone could type in
//    a stranger's number and text-bomb them, so the send is withheld
//    (`turnstile_fallback`) even though the lead itself is still recorded for
//    manual follow-up.

type Repos = ReturnType<typeof createRepositories>;

export interface LeadIntakeRequest {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  zip?: unknown;
  service?: unknown;
  consentText?: unknown;
  consentVersion?: unknown;
  /** Computed by the route from `verifyTurnstile` — never re-derived here. */
  turnstileVerified?: unknown;
  gaClientId?: unknown;
}

export type DispatchStatus = 'queued' | 'suppressed_policy' | 'deferred' | 'not_configured';

export interface LeadIntakeDeps {
  now: number;
  newId: () => string;
  consentIp?: string | null;
  consentUa?: string | null;
  consentSourceUrl?: string | null;
  gateTable?: ZipGateTable;
  /**
   * Undefined when the LEAD_AUTHORITY/LEAD_SMS_QUEUE bindings aren't wired
   * yet — intake proceeds and the lead is simply left `dispatch: 'deferred'`
   * for a later sweep, never blocked on it. When present, the closure owns
   * BOTH the DO reservation and the queue enqueue (send-eligible + not sent
   * is a state this module must never produce, so pairing them behind one
   * injection point keeps that invariant at the caller, not re-derived here).
   */
  dispatchSms?: (
    leadId: string,
    phoneE164: string,
    now: number,
    isSuppressed: boolean,
  ) => Promise<ReserveResult>;
}

export type LeadIntakeOutcome = 'created' | 'malformed';
export type LeadIntakeReason =
  | 'ok'
  | 'missing_name'
  | 'invalid_phone'
  | 'invalid_zip'
  | 'missing_service'
  | 'missing_consent';

export interface LeadIntakeResult {
  outcome: LeadIntakeOutcome;
  reason: LeadIntakeReason;
  leadId?: string;
  phoneE164?: string;
  dispatch?: DispatchStatus;
}

/**
 * Normalize a raw phone to NANP E.164 (`+1XXXXXXXXXX`), or null. Accepts
 * common US formatting (spaces/dashes/parens, an optional leading `1`/`+1`);
 * rejects anything that isn't a plausible NANP number (area code / exchange
 * code must start 2-9 — the [C2-0xx] "NANP restriction" this Worker never
 * sends SMS outside of).
 */
export function normalizeNanpPhone(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const digits = raw.replace(/[^\d+]/g, '');
  let tenDigit: string;
  if (/^\+1\d{10}$/.test(digits)) tenDigit = digits.slice(2);
  else if (/^1\d{10}$/.test(digits)) tenDigit = digits.slice(1);
  else if (/^\d{10}$/.test(digits)) tenDigit = digits;
  else return null;

  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(tenDigit)) return null;
  return `+1${tenDigit}`;
}

export async function intakeLead(
  req: LeadIntakeRequest,
  repos: Repos,
  deps: LeadIntakeDeps,
): Promise<LeadIntakeResult> {
  const name = typeof req.name === 'string' ? req.name.trim() : '';
  if (!name) return { outcome: 'malformed', reason: 'missing_name' };

  const phoneE164 = normalizeNanpPhone(req.phone);
  if (!phoneE164) return { outcome: 'malformed', reason: 'invalid_phone' };

  const zip = normalizeZip(req.zip);
  if (!zip) return { outcome: 'malformed', reason: 'invalid_zip' };

  const service = typeof req.service === 'string' ? req.service.trim() : '';
  if (!service) return { outcome: 'malformed', reason: 'missing_service' };

  const consentText = typeof req.consentText === 'string' ? req.consentText.trim() : '';
  const consentVersion = typeof req.consentVersion === 'string' ? req.consentVersion.trim() : '';
  if (!consentText || !consentVersion) return { outcome: 'malformed', reason: 'missing_consent' };

  const email = typeof req.email === 'string' && req.email.trim() ? req.email.trim() : null;
  const gaClientId = typeof req.gaClientId === 'string' && req.gaClientId ? req.gaClientId : null;

  // resolveZipGate never returns null for an already-normalized zip.
  const gate = resolveZipGate(zip, deps.gateTable ?? SUFFOLK_ZIP_GATE)!;
  const gated = gate.kind === 'informational_only';
  const town = gate.townSlugs[0] ?? null;

  let smsSuppressedReason: 'turnstile_fallback' | 'east_end_gate' | 'opt_out' | null = null;
  let dispatch: DispatchStatus;
  if (gated) {
    smsSuppressedReason = 'east_end_gate';
    dispatch = 'suppressed_policy';
  } else if (req.turnstileVerified !== true) {
    smsSuppressedReason = 'turnstile_fallback';
    dispatch = 'suppressed_policy';
  } else if (!deps.dispatchSms) {
    dispatch = 'not_configured';
  } else {
    dispatch = 'deferred'; // provisional — resolved below once the lead row exists
  }

  // Write the lead + its consent evidence FIRST — the dispatch call below may
  // enqueue a queue message that a consumer could process before this
  // function returns, and that consumer looks the lead up by id. Enqueuing
  // before the row exists would race it into a spurious `lead_not_found`.
  const leadId = deps.newId();
  await repos.lead.insert({
    id: leadId,
    createdAt: deps.now,
    name,
    phoneE164,
    email,
    zip,
    service,
    town,
    channel: 'sms',
    advertisingStatus: gated ? 'informational_only' : 'active',
    smsSuppressedReason,
    gaClientId,
    consentVersion,
    consentIp: deps.consentIp ?? null,
    consentUa: deps.consentUa ?? null,
    consentSourceUrl: deps.consentSourceUrl ?? null,
    consentTimestamp: deps.now,
  });
  await repos.consent.append({
    id: deps.newId(),
    phoneE164,
    consentText,
    consentVersion,
    consentTimestamp: deps.now,
    consentIp: deps.consentIp ?? null,
    consentUa: deps.consentUa ?? null,
    consentSourceUrl: deps.consentSourceUrl ?? null,
    leadId,
  });

  if (!gated && req.turnstileVerified === true && deps.dispatchSms) {
    const isSuppressed = await repos.suppression.isSuppressed('sms', phoneE164);
    const reserve = await deps.dispatchSms(leadId, phoneE164, deps.now, isSuppressed);
    if (reserve.allow) {
      dispatch = 'queued';
    } else if (reserve.reason === 'suppressed') {
      // Policy fact only knowable after the D1 suppression read above, which
      // had to happen after the lead row was written (see comment above) —
      // patch it in now so later reads (operator dashboard, slo-sweep cron)
      // see the real reason instead of null.
      await repos.lead.setSmsSuppressedReason(leadId, 'opt_out', deps.now);
      dispatch = 'suppressed_policy';
    } else {
      // rate_limited / budget_exceeded — transient capacity denial, not a
      // policy suppression. The lead stays eligible; a later sweep over
      // `speed_to_lead_sms_sent_at IS NULL` retries it (spec §3.1).
      dispatch = 'deferred';
    }
  }

  return { outcome: 'created', reason: 'ok', leadId, phoneE164, dispatch };
}
