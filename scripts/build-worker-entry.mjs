#!/usr/bin/env node
// Postbuild smoke check for the custom Worker entry (src/worker/entry.ts,
// wired as `main` in wrangler.toml — see docs/build/PROPOSAL-api-wiring.md
// addendum, "the DO/Queue entry-export gap"). `astro build` compiles that
// file into dist/server/entry.mjs, the artifact `wrangler deploy` ships.
//
// Dynamically importing dist/server/entry.mjs under plain Node isn't
// possible — it still contains `import { DurableObject } from
// "cloudflare:workers"`, a real Workers-runtime-only virtual module Node
// has no polyfill for (confirmed by trying it). So this checks the
// COMPILED OUTPUT's own `export { ... }` statement(s) instead of executing
// the module: if a future @astrojs/cloudflare upgrade changes how it
// composes `handle`/DO classes/queue()/scheduled() such that the build
// still succeeds but silently drops one of these exports, this catches it
// (a build failure outright is already caught by `astro build`'s own exit
// code — this covers the "build succeeds, export shape quietly changes"
// gap that leaves).
//
// Run automatically as `npm run build`'s postbuild step.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const ENTRY_PATH = join(ROOT, 'dist', 'server', 'entry.mjs');
const REQUIRED_EXPORTS = ['default', 'SmsAuthorityDO', 'queue', 'scheduled'];

function exportedNames(source) {
  // Matches every `export { a, b as c, ... };` block (there can be more than
  // one — bundlers sometimes emit re-exports separately from the entry's own
  // declarations) and collects the external (post-`as`) name of each binding.
  const names = new Set();
  const blockRe = /export\s*\{([^}]*)\}/g;
  let block;
  while ((block = blockRe.exec(source)) !== null) {
    for (const part of block[1].split(',')) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const asMatch = trimmed.match(/\bas\s+(\S+)/);
      names.add(asMatch ? asMatch[1] : trimmed);
    }
  }
  return names;
}

if (!existsSync(ENTRY_PATH)) {
  console.error(`build-worker-entry: ${ENTRY_PATH} does not exist — run "astro build" first.`);
  process.exit(1);
}

const source = readFileSync(ENTRY_PATH, 'utf8');
const found = exportedNames(source);
const missing = REQUIRED_EXPORTS.filter((name) => !found.has(name));

if (missing.length > 0) {
  console.error(
    `build-worker-entry: dist/server/entry.mjs is missing required export(s): ${missing.join(', ')}.\n` +
      'This means Cloudflare would deploy a Worker without a fetch handler, the ' +
      'SmsAuthorityDO Durable Object class, or the queue()/scheduled() consumer — ' +
      'check whether @astrojs/cloudflare or src/worker/entry.ts changed shape.',
  );
  process.exit(1);
}

console.log(`build-worker-entry: OK — dist/server/entry.mjs exports ${REQUIRED_EXPORTS.join(', ')}.`);
