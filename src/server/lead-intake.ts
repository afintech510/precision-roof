import type { createRepositories } from '../db/repositories';
import { resolveZipGate, type ZipGateTable, SUFFOLK_ZIP_GATE } from './east-end-gate';
import type { ReserveOutcome } from './sms-authority';
import type { SmsDispatchMessage } from './sms-dispatch';
import { SPEED_TO_LEAD_BODY } from './slo-sweep';

// Lead intake core (spec §3.1, §3.2 `POST /api/lead`, F-009/F-012). Pure
// decision logic over the repos + the injected DO reservation call, so it
// unit-tests without a Worker runtime. The API route is a thin adapter that
// supplies D1 repos, the Turnstile verification result, and a `reserveSms`
// function bound to the SMS_AUTHORITY Durable Object.
//
// CRITICALs enforced here:
//  - The lead is persisted and the response returned BEFORE any SMS send is
//    attempted — the caller enqueues onto the Queue and never awaits Twilio.
//  - The DO is called at most ONCE per submission [C2-003]. Its `allow`/`deny`
//    IS the honest `channel` field.
//  - East-End gate / Turnstile-fallback leads never reach the DO at all — they
//    are marked permanently SMS-ineligible (`sms_suppressed_reason`) up front.

type Repos = ReturnType<typeof createRepositories>;

/** Canonical service slugs this endpoint accepts (spec "NANP + enum + E.164
 * validation"). Mirrors `src/lib/sample.ts`'s service catalog; data-driven so
 * it can be swapped for a CMS-sourced list later without touching the core —
 * same pattern as `SUFFOLK_ZIP_GATE`. */
export const LEAD_SERVICE_SLUGS = [
  'roof-replacement',
  'roof-repair',
  'emergency-roof-repair',
  'storm-damage-roof-repair',
  'roof-leak-repair',
  'flat-low-slope-roofing',
  'metal-roofing',
  'roof-inspection',
] as const;

/** Consent text/version pair currently valid for a submitted `consentVersion`
 * (spec §7.3: "consent version taken from the client payload and server-
 * validated against currently-valid versions"). A consent-text change adds a
 * new version here rather than mutating an existing one. */
export const CURRENT_CONSENT_VERSION = 'v1';
export const CONSENT_TEXT: Record<string, string> = {
  v1:
    'By checking this box, I agree to be contacted by Premium Roofing Solutions by ' +
    'call, text, and email — including by autodialer/prerecorded message — about my ' +
    'request, even if my number is on a do-not-call list. Consent is not a condition ' +
    'of purchase. Msg & data rates may apply. Reply STOP to opt out, HELP for help.',
};

const NANP_E164 = /^\+1[2-9]\d{2}[2-9]\d{6}$/;
function normalizePhone(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return NANP_E164.test(trimmed) ? trimmed : null;
}

function normalizeName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 && trimmed.length <= 200 ? trimmed : null;
}

function normalizeEmail(raw: unknown): string | null | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined;
  if (typeof raw !== 'string') return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim()) ? raw.trim() : null;
}

/** A native (JS-disabled) `<form method="post">` submits a checked checkbox
 * as the string `"on"` (or its `value=`, if set) via `application/
 * x-www-form-urlencoded` — never the JSON boolean `true` the fetch-enhanced
 * path sends. Both must count as consent given, or the native-POST fallback
 * (spec §4/§9) would silently reject every no-JS submission. */
function normalizeConsent(raw: unknown): boolean {
  return raw === true || raw === 'on' || raw === 'true' || raw === '1';
}

export interface LeadIntakeRequest {
  name?: unknown;
  phoneE164?: unknown;
  email?: unknown;
  zip?: unknown;
  serviceSlug?: unknown;
  consentGiven?: unknown;
  consentVersion?: unknown;
  gaClientId?: unknown;
}

export interface LeadIntakeContext {
  gateTable?: ZipGateTable;
}

export interface LeadIntakeDeps {
  now: number;
  newId: () => string;
  ip?: string | null;
  userAgent?: string | null;
  sourceUrl?: string | null;
  /** Best-effort Turnstile result — never fails closed; `verified: false` (whether
   * blocked or skipped) routes to the SMS-free fallback, matching /api/quote's
   * "a transparency/conversion feature must never fail closed into invisibility". */
  turnstileVerified: boolean;
  /** Bound to the SMS_AUTHORITY Durable Object; called at most once. */
  reserveSms: (phoneE164: string, leadId: string) => Promise<ReserveOutcome>;
  /** Bound to the SMS_QUEUE producer; only called when the DO allows. */
  enqueueSms: (msg: SmsDispatchMessage) => Promise<void>;
}

export type LeadIntakeMalformedField =
  | 'name' | 'phone' | 'email' | 'zip' | 'service' | 'consent' | 'consent_version';

export type LeadIntakeResult =
  | { outcome: 'created'; status: 201; leadId: string; channel: 'sms' }
  | { outcome: 'accepted'; status: 202; leadId: string; channel: 'callback'; reason: string }
  | { outcome: 'malformed'; status: 400; field: LeadIntakeMalformedField };

export async function handleLeadIntake(
  req: LeadIntakeRequest,
  repos: Repos,
  ctx: LeadIntakeContext,
  deps: LeadIntakeDeps,
): Promise<LeadIntakeResult> {
  const name = normalizeName(req.name);
  if (name === null) return { outcome: 'malformed', status: 400, field: 'name' };

  const phone = normalizePhone(req.phoneE164);
  if (phone === null) return { outcome: 'malformed', status: 400, field: 'phone' };

  const email = normalizeEmail(req.email);
  if (email === null) return { outcome: 'malformed', status: 400, field: 'email' };

  const gate = resolveZipGate(req.zip, ctx.gateTable ?? SUFFOLK_ZIP_GATE);
  if (gate === null) return { outcome: 'malformed', status: 400, field: 'zip' };
  const zip = String(req.zip).trim();

  if (typeof req.serviceSlug !== 'string' || !LEAD_SERVICE_SLUGS.includes(req.serviceSlug as never)) {
    return { outcome: 'malformed', status: 400, field: 'service' };
  }
  const service = req.serviceSlug;

  if (!normalizeConsent(req.consentGiven)) return { outcome: 'malformed', status: 400, field: 'consent' };
  const consentVersion = typeof req.consentVersion === 'string' ? req.consentVersion : CURRENT_CONSENT_VERSION;
  const consentText = CONSENT_TEXT[consentVersion];
  if (!consentText) return { outcome: 'malformed', status: 400, field: 'consent_version' };

  const leadId = deps.newId();
  const gaClientId = typeof req.gaClientId === 'string' ? req.gaClientId : null;

  // East-End gate: a gated match is a fail-safe, permanent SMS exclusion —
  // never reaches the DO (a text soliciting business is itself advertising).
  if (gate.kind === 'informational_only') {
    await repos.lead.insert({
      id: leadId, createdAt: deps.now, name, phoneE164: phone, email, zip, service,
      town: gate.townSlugs[0] ?? null, channel: 'callback', advertisingStatus: 'informational_only',
      smsSuppressedReason: 'east_end_gate', gaClientId,
      consentVersion, consentIp: deps.ip ?? null, consentUa: deps.userAgent ?? null,
      consentSourceUrl: deps.sourceUrl ?? null, consentTimestamp: deps.now,
    });
    await writeConsent(repos, leadId, phone, consentText, consentVersion, deps);
    return { outcome: 'accepted', status: 202, leadId, channel: 'callback', reason: 'east_end_gate' };
  }

  // Turnstile blocked/unavailable → genuinely SMS-free fallback path
  // [C2-001, C2-015]: never eligible for the SMS path, including slo-sweep.
  if (!deps.turnstileVerified) {
    await repos.lead.insert({
      id: leadId, createdAt: deps.now, name, phoneE164: phone, email, zip, service,
      town: gate.townSlugs[0] ?? null, channel: 'callback', advertisingStatus: 'active',
      smsSuppressedReason: 'turnstile_fallback', gaClientId,
      consentVersion, consentIp: deps.ip ?? null, consentUa: deps.userAgent ?? null,
      consentSourceUrl: deps.sourceUrl ?? null, consentTimestamp: deps.now,
    });
    await writeConsent(repos, leadId, phone, consentText, consentVersion, deps);
    return { outcome: 'accepted', status: 202, leadId, channel: 'callback', reason: 'turnstile_fallback' };
  }

  // Advertising-eligible: persist first, THEN call the DO exactly once.
  await repos.lead.insert({
    id: leadId, createdAt: deps.now, name, phoneE164: phone, email, zip, service,
    town: gate.townSlugs[0] ?? null, advertisingStatus: 'active', gaClientId,
    consentVersion, consentIp: deps.ip ?? null, consentUa: deps.userAgent ?? null,
    consentSourceUrl: deps.sourceUrl ?? null, consentTimestamp: deps.now,
  });
  await writeConsent(repos, leadId, phone, consentText, consentVersion, deps);

  const reservation = await deps.reserveSms(phone, leadId);
  if (!reservation.allow) {
    // channel stays NULL, sms_suppressed_reason stays NULL — sweep-eligible retry.
    return { outcome: 'accepted', status: 202, leadId, channel: 'callback', reason: reservation.reason };
  }

  await repos.lead.setChannel(leadId, 'sms', deps.now);
  await deps.enqueueSms({ leadId, phoneE164: phone, body: SPEED_TO_LEAD_BODY, allowToken: reservation.token });
  return { outcome: 'created', status: 201, leadId, channel: 'sms' };
}

async function writeConsent(
  repos: Repos,
  leadId: string,
  phoneE164: string,
  consentText: string,
  consentVersion: string,
  deps: LeadIntakeDeps,
): Promise<void> {
  await repos.consent.append({
    id: deps.newId(), phoneE164, consentText, consentVersion, consentTimestamp: deps.now,
    consentIp: deps.ip ?? null, consentUa: deps.userAgent ?? null, consentSourceUrl: deps.sourceUrl ?? null,
    leadId,
  });
}
