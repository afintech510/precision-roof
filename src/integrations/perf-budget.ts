import type { AstroIntegration } from 'astro';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkBudget } from '../lib/perf-budget';

// Fails `astro build` if any emitted page exceeds the performance budget
// (≤4 third-party scripts, images must carry explicit dimensions). SOW §7.

function walkHtml(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkHtml(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

export function perfBudget(opts: { siteHost?: string; maxScripts?: number } = {}): AstroIntegration {
  const siteHost = opts.siteHost ?? 'premiumroofsolutions.com';
  const maxScripts = opts.maxScripts ?? 4;
  return {
    name: 'perf-budget',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const files = walkHtml(root);
        const violations: string[] = [];
        for (const file of files) {
          const res = checkBudget(readFileSync(file, 'utf8'), siteHost, maxScripts);
          const rel = file.slice(root.length).replace(/\\/g, '/');
          if (res.scripts > maxScripts) violations.push(`${rel}: ${res.scripts} third-party scripts (max ${maxScripts})`);
          if (res.imagesMissingDims > 0) violations.push(`${rel}: ${res.imagesMissingDims} <img> without width/height`);
        }
        if (violations.length) {
          throw new Error(`Performance budget failed:\n  ${violations.join('\n  ')}`);
        }
        logger.info(`perf budget OK — ${files.length} pages, ≤${maxScripts} third-party scripts, all images sized`);
      },
    },
  };
}
