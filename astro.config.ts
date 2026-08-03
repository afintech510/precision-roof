import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import { perfBudget } from './src/integrations/perf-budget';

// Static-first (spec §1.2). API routes opt into on-demand rendering per-route
// with `export const prerender = false`, served by the Cloudflare adapter.
export default defineConfig({
  site: 'https://premiumroofsolutions.com',
  output: 'static',
  adapter: cloudflare(),
  integrations: [sitemap(), perfBudget()],
  // Astro's default form-POST origin check blocks legitimate cross-site webhook
  // callbacks (Twilio posts application/x-www-form-urlencoded from its servers).
  // Our webhooks authenticate by provider signature (Twilio/Cal.com/Sanity) and
  // /api/quote is JSON + Turnstile, so we disable the origin check here [C2-002].
  security: { checkOrigin: false },
});
