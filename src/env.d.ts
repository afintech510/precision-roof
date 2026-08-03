/// <reference types="astro/client" />
import type { D1Database, KVNamespace } from '@cloudflare/workers-types';

// Runtime bindings + secrets reachable on `Astro.locals.runtime.env` under the
// @astrojs/cloudflare adapter. Bindings live in wrangler.toml; secrets are set
// via `wrangler … secret put` (Doppler-sourced) and are optional in types so
// routes degrade gracefully when one isn't provisioned yet (never fail closed).
//
// The adapter's own types now expose `locals.cfContext`; `locals.runtime` is a
// still-functional (deprecated) getter that isn't typed, so we merge it back in.
interface Env {
  OP_STORE: D1Database;
  PRICING_KV?: KVNamespace;
  TURNSTILE_SECRET?: string;
  SANITY_WEBHOOK_SECRET?: string;
  SANITY_API_TOKEN?: string;
  RESEND_TOKEN_SECRET?: string;
  POSTMARK_SERVER_TOKEN?: string;
  CALCOM_WEBHOOK_SECRET?: string;
  TWILIO_AUTH_TOKEN?: string;
  GA4_API_SECRET?: string;
  GA4_MEASUREMENT_ID?: string;
}

declare global {
  namespace App {
    interface Locals {
      runtime: { env: Env };
    }
  }
}

export {};
