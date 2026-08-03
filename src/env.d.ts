/// <reference types="astro/client" />
import type { D1Database, KVNamespace, Queue } from '@cloudflare/workers-types';
import type { LeadAuthorityBinding } from './server/lead-authority';
import type { SmsDispatchJob } from './server/lead-dispatch';

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
      // Per-phone/budget/suppression authority (spec §1.2, §3.1) — not yet
      // bound in wrangler.toml; see src/server/sms-queue-consumer.ts for why.
      LEAD_AUTHORITY?: LeadAuthorityBinding;
      // Async speed-to-lead SMS dispatch (spec §3.1) — same deferral as above.
      LEAD_SMS_QUEUE?: Queue<SmsDispatchJob>;
      TURNSTILE_SECRET?: string;
      SANITY_WEBHOOK_SECRET?: string;
      SANITY_API_TOKEN?: string;
      RESEND_TOKEN_SECRET?: string;
      POSTMARK_SERVER_TOKEN?: string;
      CALCOM_WEBHOOK_SECRET?: string;
      TWILIO_ACCOUNT_SID?: string;
      TWILIO_AUTH_TOKEN?: string;
      TWILIO_MESSAGING_SERVICE_SID?: string;
      GA4_API_SECRET?: string;
      GA4_MEASUREMENT_ID?: string;
    }
  }
}

export {};
