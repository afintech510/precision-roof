#!/usr/bin/env node
// Push the RUNTIME secret subset to Cloudflare Pages (production).
//
// Runtime secrets are the ones a Worker/Pages Function reads per request.
// Build/CLI creds (CLOUDFLARE_API_TOKEN) and public config (GA4_MEASUREMENT_ID,
// TURNSTILE_SITE_KEY, SANITY_PROJECT_ID, …) are intentionally NOT pushed here.
//
// Source of values (pick one):
//   node scripts/push-runtime-secrets.mjs --from-doppler          # needs `doppler` CLI, logged in
//   node scripts/push-runtime-secrets.mjs --file ./my.secrets.json # a local { "KEY":"val" } JSON (gitignored)
//
// Nothing is written to the repo; a temp file in the OS temp dir is created for
// `wrangler pages secret bulk` and deleted immediately after.
//
// Adam gates prod mutations — run this yourself when ready; it is never run by
// the build orchestrator.

import { execFileSync } from 'node:child_process';
import { writeFileSync, unlinkSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PROJECT = 'precision-roof';

// Keys that belong in the Cloudflare runtime. Extend as phases land.
const RUNTIME_KEYS = [
  'SANITY_API_TOKEN',
  'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_MESSAGING_SERVICE_SID', 'TWILIO_PHONE_NUMBER',
  'TURNSTILE_SECRET_KEY',
  'GA4_API_SECRET',
  'CALCOM_API_KEY', 'CALCOM_WEBHOOK_SECRET',
  'CALLRAIL_API_KEY', 'CALLRAIL_ACCOUNT_ID',
  'FINANCING_API_KEY', 'FINANCING_PARTNER_ID',
  'POSTMARK_SERVER_TOKEN', 'AWS_SES_ACCESS_KEY_ID', 'AWS_SES_SECRET_ACCESS_KEY', 'AWS_SES_REGION',
  'CF_ACCESS_AUD',
  'GBP_CLIENT_SECRET', 'GBP_REFRESH_TOKEN',
];

function loadFromDoppler() {
  const out = execFileSync('doppler', ['secrets', 'download', '--no-file', '--format=json'], {
    encoding: 'utf8',
  });
  return JSON.parse(out);
}

function loadFromFile(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

const args = process.argv.slice(2);
const fileIdx = args.indexOf('--file');
let all;
try {
  all = fileIdx !== -1 ? loadFromFile(args[fileIdx + 1]) : loadFromDoppler();
} catch (e) {
  console.error('Could not load secrets:', e.message);
  console.error('Install/login the Doppler CLI (doppler login && doppler setup), or pass --file <json>.');
  process.exit(1);
}

const payload = {};
for (const k of RUNTIME_KEYS) {
  if (all[k] != null && all[k] !== '') payload[k] = String(all[k]);
}
const keys = Object.keys(payload);
if (keys.length === 0) {
  console.error('No runtime keys found in the source. Nothing to push.');
  process.exit(1);
}

console.log(`Pushing ${keys.length} runtime secret(s) to Pages project "${PROJECT}":`);
console.log('  ' + keys.join(', '));

const tmp = join(tmpdir(), `pr-secrets-${process.pid}.json`);
writeFileSync(tmp, JSON.stringify(payload), { mode: 0o600 });
try {
  execFileSync('npx', ['wrangler', 'pages', 'secret', 'bulk', tmp, '--project-name', PROJECT], {
    stdio: 'inherit',
  });
} finally {
  try { unlinkSync(tmp); } catch { /* already gone */ }
}
console.log('Done. Preview-environment secrets: set in the Cloudflare dashboard (wrangler targets production).');
