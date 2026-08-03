import type { AstroIntegration } from 'astro';
import { readFileSync, readdirSync, writeFileSync, existsSync, appendFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getServices, getTowns } from '../lib/content';
import { buildUrlSetXml, buildSitemapIndexXml, groupBySitemapCategory } from '../lib/seo';
import { buildLinkGraph, bfsDepths, findDepthViolations } from '../lib/link-graph';
import { computeAnchorRatio } from '../lib/anchor-ratio';
import { REDIRECTS, validateRedirects, buildRedirectsFile } from '../lib/redirects';

// Phase 06 SEO-technical build gate (spec §4.4, SOW §5/§8, F-006/F-017):
// split sitemaps by content type, the ≤30% exact-match anchor-ratio check,
// the "no page >2 clicks from home" link-graph check, and 301 redirect
// discipline. Runs alongside perf-budget/csp as an astro:build:done gate —
// failing any of these fails `npm run build`, matching how those two work.

function walkHtml(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkHtml(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function toPathname(root: string, file: string): string {
  const rel = relative(root, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  return `/${rel.replace(/index\.html$/, '')}`;
}

export function seoTechnical(opts: { anchorRatioMax?: number; maxClickDepth?: number } = {}): AstroIntegration {
  const anchorRatioMax = opts.anchorRatioMax ?? 0.3;
  const maxClickDepth = opts.maxClickDepth ?? 2;

  return {
    name: 'seo-technical',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const files = walkHtml(root);
        const pages: Record<string, string> = {};
        for (const file of files) pages[toPathname(root, file)] = readFileSync(file, 'utf8');
        const htmlDocs = Object.values(pages);
        const siteHost = 'premiumroofsolutions.com';
        const siteUrl = `https://${siteHost}`;

        // --- Split sitemaps by content type -------------------------------
        const pageUrls = Object.keys(pages).map((p) => `${siteUrl}${p}`);
        const groups = groupBySitemapCategory(pageUrls, siteUrl);
        const written: string[] = [];
        for (const [category, urls] of Object.entries(groups)) {
          const filename = `sitemap-${category}.xml`;
          writeFileSync(join(root, filename), buildUrlSetXml(urls));
          // Search Console flags empty sitemaps — write the file (so the URL
          // never 404s once a category gains content) but only index non-empty ones.
          if (urls.length) written.push(`${siteUrl}/${filename}`);
        }
        writeFileSync(join(root, 'sitemap-index.xml'), buildSitemapIndexXml(written));

        // --- Anchor-ratio check --------------------------------------------
        const services = await getServices();
        const towns = await getTowns();
        const anchorResult = computeAnchorRatio(
          htmlDocs,
          services.map((s) => s.name),
          towns.map((t) => t.name),
        );
        if (anchorResult.ratio > anchorRatioMax) {
          throw new Error(
            `Exact-match anchor ratio ${(anchorResult.ratio * 100).toFixed(1)}% exceeds the ${anchorRatioMax * 100}% cap ` +
              `(${anchorResult.exactMatch}/${anchorResult.total}): ${anchorResult.exactMatchAnchors.map((a) => `"${a.text}"`).join(', ')}`,
          );
        }

        // --- Link-graph depth check ------------------------------------------
        const graph = buildLinkGraph(pages, siteHost);
        const depths = bfsDepths(graph, '/');
        const violations = findDepthViolations(depths, maxClickDepth);
        if (violations.length) {
          throw new Error(
            `${violations.length} page(s) are more than ${maxClickDepth} clicks from home:\n  ` +
              violations.map((v) => `${v.pathname} (${v.depth === Infinity ? 'unreachable' : `${v.depth} clicks`})`).join('\n  '),
          );
        }

        // --- Redirect discipline --------------------------------------------
        const redirectCheck = validateRedirects(REDIRECTS);
        if (!redirectCheck.ok) {
          throw new Error(`Redirect discipline violated:\n  ${redirectCheck.errors.join('\n  ')}`);
        }
        if (REDIRECTS.length) {
          const redirectsPath = join(root, '_redirects');
          const prefix = existsSync(redirectsPath) ? '\n' : '';
          appendFileSync(redirectsPath, `${prefix}${buildRedirectsFile(REDIRECTS)}\n`);
        }

        logger.info(
          `seo-technical OK — ${written.length} split sitemaps, anchor ratio ${(anchorResult.ratio * 100).toFixed(1)}% (≤${anchorRatioMax * 100}%), ` +
            `max click-depth ${Math.max(...Object.values(depths).filter((d) => d !== Infinity))} (≤${maxClickDepth}), ${REDIRECTS.length} redirect(s)`,
        );
      },
    },
  };
}
