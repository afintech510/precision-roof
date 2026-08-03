import { createRepositories } from '../db/repositories';
import { d1Executor } from '../db/executor';
import { runRetentionSweep } from './retention';

// Thin Cron Trigger adapter over the pure `runRetentionSweep` core (Phase 08,
// spec §1.3, §8). All the logic lives in retention.ts so it stays
// unit-testable without a Worker runtime; this function only supplies the
// real D1 repos.
//
// NOT YET WIRED, same root cause as src/server/sms-queue-consumer.ts and
// lead-authority-do.ts: the @astrojs/cloudflare adapter's generated Worker
// entry exports only `{ fetch: handle }` — no `scheduled()` handler hook
// either, by the same grep-confirmed absence. Wiring a Cron Trigger needs the
// same deploy-topology decision already deferred to Adam for the DO + Queue
// (custom worker-entry re-export vs. a separate small Worker); adding a
// `[triggers]` cron here without one of those in place would have nothing to
// invoke. Once that decision lands, this export is what it calls.
export async function scheduled(env: Cloudflare.Env): Promise<void> {
  const repos = createRepositories(d1Executor(env.OP_STORE));
  await runRetentionSweep(repos, Date.now());
}
