import { createRepositories } from '../db/repositories';
import { d1Executor } from '../db/executor';
import { twilioSender } from './twilio-send';
import { runSloSweep, type SloSweepResult } from './slo-sweep';

// Thin Cron Trigger adapter over the pure `runSloSweep` core (Phase 05b Task
// 6, spec §3.2). All the logic lives in slo-sweep.ts so it stays unit-
// testable without a Worker runtime; this function only supplies the real DO
// stub + D1 repos + Twilio sender.
export async function scheduled(env: Cloudflare.Env): Promise<SloSweepResult | undefined> {
  if (!env.SMS_AUTHORITY || !env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM_NUMBER) {
    return; // never fail closed on a missing binding/secret — just skip this tick
  }

  const repos = createRepositories(d1Executor(env.OP_STORE));
  const authority = env.SMS_AUTHORITY.get(env.SMS_AUTHORITY.idFromName('global'));
  return runSloSweep(repos, authority, {
    now: Date.now(),
    newId: () => crypto.randomUUID(),
    sendSms: twilioSender({
      accountSid: env.TWILIO_ACCOUNT_SID,
      authToken: env.TWILIO_AUTH_TOKEN,
      fromNumber: env.TWILIO_FROM_NUMBER,
    }),
  });
}
