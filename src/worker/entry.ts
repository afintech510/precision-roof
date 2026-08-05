import { handle } from '@astrojs/cloudflare/handler';
import { SmsAuthorityDO } from '../durable-objects/sms-authority-do';
import { queue as smsQueueConsumer } from '../server/sms-queue-consumer';
import { scheduled as sloSweepScheduled } from '../server/slo-sweep-cron';
import { scheduled as retentionScheduled } from '../server/retention-cron';
import { scheduled as reviewRequestScheduled } from '../server/review-request-cron';
import type { SmsDispatchMessage } from '../server/sms-dispatch';

// Custom Worker entry — the composition point the @astrojs/cloudflare
// adapter has no built-in way to provide (see docs/build/PROPOSAL-api-wiring.md
// addendum, "the DO/Queue entry-export gap"; option (i) of the two it weighs).
// `wrangler.toml`'s `main` points at THIS file instead of the adapter's
// default (`@astrojs/cloudflare/entrypoints/server`, which only exports
// `fetch`), so the Worker Astro's own build produces also carries the
// `SmsAuthorityDO` class plus the `queue()`/`scheduled()` handlers those
// bindings need.
//
// `handle` is the SAME function the adapter's default entrypoint uses
// (node_modules/@astrojs/cloudflare/dist/entrypoints/server.js) — importing
// it from the package's public `./handler` subpath, not by reaching into
// a build artifact, is what makes this composable at all: the adapter's own
// `dist/server/entry.mjs` doesn't exist yet at the point this file gets
// bundled (this file's compilation *is* what produces it) — confirmed by
// trying the build-artifact-import approach first and hitting exactly that
// circularity ("Could not resolve '../../dist/server/entry.mjs'").
// scripts/build-worker-entry.mjs's postbuild smoke check (bundle this file
// standalone, assert fetch/queue/scheduled/SmsAuthorityDO are all present)
// is what would catch a future @astrojs/cloudflare version moving/renaming
// this export.

export { SmsAuthorityDO };

export async function queue(batch: MessageBatch<SmsDispatchMessage>, env: Cloudflare.Env): Promise<void> {
  return smsQueueConsumer(batch, env);
}

// Cloudflare invokes `scheduled()` once per matching cron with `event.cron`
// set to the exact expression that fired (see wrangler.toml `[triggers]`) —
// this just routes to the matching sweep. Unknown/unset `cron` (shouldn't
// happen outside local `wrangler dev --test-scheduled`) is a no-op.
export async function scheduled(event: ScheduledController, env: Cloudflare.Env): Promise<void> {
  switch (event.cron) {
    case '*/5 * * * *':
      await sloSweepScheduled(env);
      return;
    case '10 3 * * *':
      await retentionScheduled(env);
      return;
    case '0 14 * * *':
      await reviewRequestScheduled(env);
      return;
  }
}

export default {
  fetch: handle,
  queue,
  scheduled,
};
