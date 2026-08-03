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
// Worker's main entry. See src/server/sms-queue-consumer.ts for the full
// writeup (confirmed by reading the installed adapter's build output, not
// assumed) and the two topology options — deferred to Adam's sign-off, same
// as this file's own deferral note used to say.
export class LeadAuthorityDO extends DurableObject {
  reserve(input: ReserveInput): Promise<ReserveResult> {
    return reserveSmsSlot(this.ctx.storage, input, { genToken: () => crypto.randomUUID() });
  }
}
