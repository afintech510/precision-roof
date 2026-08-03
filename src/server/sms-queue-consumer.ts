import type { MessageBatch } from '@cloudflare/workers-types';
import { createRepositories } from '../db/repositories';
import { d1Executor } from '../db/executor';
import { dispatchSpeedToLeadSms, DEFAULT_SPEED_TO_LEAD_MESSAGE, type SmsDispatchJob } from './lead-dispatch';
import { sendTwilioSms } from './twilio-send';

// Thin Queue-consumer adapter over the pure `dispatchSpeedToLeadSms` core
// (spec §3.1 §3.2, F-009). All the logic lives in lead-dispatch.ts so it stays
// unit-testable without a Worker runtime; this function only supplies the real
// D1 repos + the real Twilio adapter, and acks/retries per Cloudflare Queues
// semantics (ack on any resolved outcome — a permanent send failure is
// recorded and surfaced to the operator dashboard for manual resend, not
// retried automatically; only an unexpected throw goes through Queues' own
// retry policy).
//
// NOT YET WIRED, same as lead-authority-do.ts, and for the same root cause —
// confirmed this run by reading the installed @astrojs/cloudflare 14.1.7
// output directly (dist/entrypoints/server.js + the `dist/server/entry.mjs`
// a real `astro build` produces here): the adapter's generated Worker entry
// exports ONLY `{ fetch: handle }`. There is no config option, file-scanning
// convention, or virtual-module hook that lets a project add extra top-level
// exports (a DurableObject class, a `queue()` handler) to that generated
// entry — confirmed by grepping the adapter's dist for `DurableObject`/`queue`
// (no hits outside an unrelated `queues.producers` dev-preview passthrough).
//
// Two ways to actually wire this + LeadAuthorityDO, neither of which this
// increment picks (this is a deploy-topology decision, same class of decision
// as PROPOSAL-api-wiring.md's Option A/B — needs Adam's sign-off, not a
// unilateral choice from an unattended run):
//   (A) Hand-write a top-level Worker entry (e.g. `worker-entry.ts`) that
//       imports the astro-generated `dist/server/entry.mjs` default export and
//       re-exports its `fetch` alongside `{ LeadAuthorityDO, queue }`, then
//       point wrangler's `main` at that file instead of the adapter's
//       auto-generated `dist/server/wrangler.json`. Single deployed Worker;
//       requires overriding how `wrangler deploy` is invoked today (currently
//       undocumented in this repo — the one prior deploy was done by hand).
//   (B) Deploy the DO + queue consumer as a SEPARATE small Worker (its own
//       wrangler.toml/entry, exporting `LeadAuthorityDO` and `queue()`
//       directly — no Astro adapter involved) and reference it from the main
//       worker's `wrangler.toml` via `[[durable_objects.bindings]] script_name
//       = "<that worker>"` for the DO, and a plain `[[queues.producers]]` for
//       the queue (producing needs no export at all — only the consumer does).
//       Two deployed Workers sharing one D1 database_id; no change to how the
//       main Astro Worker is built/deployed today.
//   (B) is lower-risk (doesn't touch the working Astro deploy path) and is
//   the one this file's shape (a standalone module with no Astro imports)
//   is written to make trivial once approved — but it's still a decision,
//   not a default, so wrangler.toml's LEAD_AUTHORITY/queue sections stay
//   unwired until Adam picks A or B.
export async function queue(batch: MessageBatch<SmsDispatchJob>, env: Cloudflare.Env): Promise<void> {
  const repos = createRepositories(d1Executor(env.OP_STORE));
  for (const message of batch.messages) {
    await dispatchSpeedToLeadSms(message.body, repos, {
      now: Date.now(),
      newId: () => crypto.randomUUID(),
      sendSms: (to, body) => sendTwilioSms(env, to, body),
      messageBody: DEFAULT_SPEED_TO_LEAD_MESSAGE,
    });
    message.ack();
  }
}
