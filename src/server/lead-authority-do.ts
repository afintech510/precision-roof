import { DurableObject } from 'cloudflare:workers';
import { reserveSmsSlot, type ReserveInput, type ReserveResult } from './lead-authority';

// Thin Durable Object adapter over the pure `reserveSmsSlot` core (spec §1.2,
// §3.1). RPC-style: `/api/lead` (and later the queue-worker send + slo-sweep
// cron) get a stub via `env.LEAD_AUTHORITY.get(idFromName(shard))` and call
// `.reserve(...)` directly — no `fetch` framing needed. All the logic lives in
// `lead-authority.ts` so it stays unit-testable without a Worker runtime; this
// class only supplies real storage.
//
// NOT YET WIRED: no `[[durable_objects.bindings]]` / `[[migrations]]` entry
// exists in wrangler.toml yet, and the class is not re-exported from the
// Worker's main entry (the `@astrojs/cloudflare` adapter's generated entry has
// no built-in mechanism for extra top-level exports like a custom DO class or
// a `queue()` handler — confirmed by reading its dist/README, not assumed).
// Wiring that is a deploy-model decision like PROPOSAL-api-wiring.md's Option
// A/B, deferred to the increment that adds the Queue dispatch + `/api/lead`
// route, so it can be decided once alongside the Queue's own entry-export need.
export class LeadAuthorityDO extends DurableObject {
  reserve(input: ReserveInput): Promise<ReserveResult> {
    return reserveSmsSlot(this.ctx.storage, input, { genToken: () => crypto.randomUUID() });
  }
}
