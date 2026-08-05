import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { perfBudget } from './src/integrations/perf-budget';
import { csp } from './src/integrations/csp';
import { seoTechnical } from './src/integrations/seo-technical';

// Static-first (spec §1.2). API routes opt into on-demand rendering per-route
// with `export const prerender = false`, served by the Cloudflare adapter.
export default defineConfig({
  site: 'https://premiumroofsolutions.com',
  output: 'static',
  // prerenderEnvironment: 'node' — the default 'workerd' spins up a local
  // Miniflare instance to render static pages, which needs a fully-startable
  // Worker. Once SmsAuthorityDO is live-bound (below / wrangler.toml), that
  // Miniflare instance uses its own internal entry resolution — NOT this
  // project's custom src/worker/entry.ts — so it crashes the same way
  // ("Class extends value undefined") regardless of wrangler.toml's `main`.
  // 'node' prerendering sidesteps that: none of our prerendered pages touch
  // Cloudflare-specific bindings, so plain Node rendering is equivalent for
  // them. See docs/build/PROPOSAL-api-wiring.md addendum — confirmed by
  // trying it, same as the rest of that finding.
  adapter: cloudflare({ prerenderEnvironment: 'node' }),
  // csp runs after perfBudget so dist/client/_headers (written by the
  // cloudflare adapter for asset caching) already exists to append to.
  // seoTechnical replaces @astrojs/sitemap with content-type-split sitemaps
  // (spec §4.4/F-017) plus the anchor-ratio/link-depth/redirect gates.
  integrations: [perfBudget(), csp(), seoTechnical()],
  // Astro's default form-POST origin check blocks legitimate cross-site webhook
  // callbacks (Twilio posts application/x-www-form-urlencoded from its servers).
  // Our webhooks authenticate by provider signature (Twilio/Cal.com/Sanity) and
  // /api/quote is JSON + Turnstile, so we disable the origin check here [C2-002].
  security: { checkOrigin: false },
});
