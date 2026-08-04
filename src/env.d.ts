/// <reference types="astro/client" />
import type { D1Database, KVNamespace, DurableObjectNamespace, Queue } from '@cloudflare/workers-types';
import type { SmsAuthorityDO } from './durable-objects/sms-authority-do';
import type { SmsDispatchMessage } from './server/sms-dispatch';

// Runtime bindings + secrets. Astro v6 removed `locals.runtime.env`; the
// @astrojs/cloudflare adapter exposes bindings via the `cloudflare:workers`
// virtual module, whose `env` is typed as `Cloudflare.Env`. We augment that
// interface so `import { env } from 'cloudflare:workers'` is typed. Bindings live
// in wrangler.toml; secrets are set via `wrangler … secret put` (Doppler-sourced)
// and are optional in types so routes degrade gracefully when one isn't
// provisioned yet (never fail closed).
declare global {
  namespace Cloudflare {
    interface Env {
      OP_STORE: D1Database;
      PRICING_KV?: KVNamespace;
      SESSION?: KVNamespace;
      // Phase 08 — public-endpoint rate-limit hardening (spec §3.3). Not yet
      // provisioned (see wrangler.toml) — routes must treat this as always
      // possibly absent and never fail closed when it's missing.
      RATE_LIMIT_KV?: KVNamespace;
      // Phase 05b — per-phone/budget/suppression concurrency authority (spec §3.1).
      SMS_AUTHORITY?: DurableObjectNamespace<SmsAuthorityDO>;
      // Phase 05b — async speed-to-lead SMS dispatch (spec §3.1).
      SMS_QUEUE?: Queue<SmsDispatchMessage>;
      TURNSTILE_SECRET?: string;
      SANITY_WEBHOOK_SECRET?: string;
      SANITY_API_TOKEN?: string;
      RESEND_TOKEN_SECRET?: string;
      POSTMARK_SERVER_TOKEN?: string;
      // Phase 09 — review-request engine (spec §5.5, F-013).
      EMAIL_FROM_ADDRESS?: string;
      // Phase 09 Task 3 — Postmark bounce/complaint webhook Basic Auth
      // credential ("user:pass", the same string embedded in the webhook URL
      // configured in the Postmark UI). Suppresses (email, address) on a hard
      // bounce or spam complaint — never on a soft/transient bounce.
      POSTMARK_WEBHOOK_SECRET?: string;
      UNSUBSCRIBE_TOKEN_SECRET?: string;
      REVIEW_URL?: string;
      SITE_ORIGIN?: string;
      CALCOM_WEBHOOK_SECRET?: string;
      CALLRAIL_WEBHOOK_SECRET?: string;
      TWILIO_AUTH_TOKEN?: string;
      TWILIO_ACCOUNT_SID?: string;
      TWILIO_FROM_NUMBER?: string;
      GA4_API_SECRET?: string;
      GA4_MEASUREMENT_ID?: string;
    }
  }
}

export {};
