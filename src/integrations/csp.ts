import type { AstroIntegration } from 'astro';
import { readFileSync, readdirSync, appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectScriptHashes, collectStyleHashes, buildHeadersBlock } from '../lib/csp';

// Appends the CSP (report-only launch mode, spec §5.9/§7.3 [C2-009]) plus
// baseline security headers to the `_headers` file the Cloudflare adapter
// already writes for asset caching. Runs after perf-budget in astro.config so
// dist/client/_headers already exists by the time this hook fires.

function walkHtml(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkHtml(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

export function csp(opts: { reportOnly?: boolean } = {}): AstroIntegration {
  return {
    name: 'csp',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const files = walkHtml(root);
        const htmlDocs = files.map((f) => readFileSync(f, 'utf8'));
        const [scriptHashes, styleHashes] = await Promise.all([
          collectScriptHashes(htmlDocs),
          collectStyleHashes(htmlDocs),
        ]);
        const block = buildHeadersBlock({ reportOnly: opts.reportOnly ?? true, scriptHashes, styleHashes });

        const headersPath = join(root, '_headers');
        const existing = existsSync(headersPath) ? readFileSync(headersPath, 'utf8') : '';
        const prefix = existing && !existing.endsWith('\n\n') ? (existing.endsWith('\n') ? '\n' : '\n\n') : '';
        appendFileSync(headersPath, `${prefix}${block}\n`);
        logger.info(
          `CSP written to _headers — ${scriptHashes.length} script hash(es), ${styleHashes.length} style hash(es), ${files.length} pages scanned`,
        );
      },
    },
  };
}
