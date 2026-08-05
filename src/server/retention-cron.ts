import { createRepositories } from '../db/repositories';
import { d1Executor } from '../db/executor';
import { runRetentionSweep } from './retention';

// Thin Cron Trigger adapter over the pure `runRetentionSweep` core (Phase 08,
// spec §1.3, §8). All the logic lives in retention.ts so it stays
// unit-testable without a Worker runtime; this function only supplies the
// real D1 repos.
//
// Wired via src/worker/entry.ts's `scheduled()`, which routes to this on the
// `10 3 * * *` cron (wrangler.toml `[triggers]`) — see
// docs/build/PROPOSAL-api-wiring.md addendum for why that indirection exists.
export async function scheduled(env: Cloudflare.Env): Promise<void> {
  const repos = createRepositories(d1Executor(env.OP_STORE));
  await runRetentionSweep(repos, Date.now());
}
